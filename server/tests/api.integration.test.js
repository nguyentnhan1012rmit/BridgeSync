const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const jwt = require('jsonwebtoken');

process.env.ACCESS_TOKEN_SECRET = 'integration-test-secret';
process.env.JWT_EXPIRES_IN = '30m';

const app = require('../app');
const User = require('../models/Users');
const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const HourensoReports = require('../models/HourensoReports');
const ITGlossary = require('../models/ITGlossary');

const memberId = '507f1f77bcf86cd799439011';
const outsiderId = '507f1f77bcf86cd799439012';
const pmId = '507f1f77bcf86cd799439013';
const projectId = '507f1f77bcf86cd799439021';
const taskId = '507f1f77bcf86cd799439031';

const originalMethods = [];

const patchMethod = (target, key, value) => {
  originalMethods.push([target, key, target[key]]);
  target[key] = value;
};

const restoreMethods = () => {
  while (originalMethods.length) {
    const [target, key, value] = originalMethods.pop();
    target[key] = value;
  }
};

const makeToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
};

const request = async (path, options = {}) => {
  const body = options.body ? JSON.stringify(options.body) : '';
  const req = new Readable({
    read() {
      this.push(body || null);
      if (body) this.push(null);
    },
  });

  req.method = options.method || 'GET';
  req.url = path;
  req.headers = {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
    ...(options.token && { authorization: `Bearer ${options.token}` }),
    ...options.headers,
  };

  // Provide mock socket/connection as a real stream that Express middleware expects
  const { Duplex } = require('node:stream');
  const mockSocket = new Duplex({ read() {}, write(_, __, cb) { cb(); } });
  mockSocket.remoteAddress = '127.0.0.1';
  req.socket = mockSocket;
  req.connection = mockSocket;
  req.ip = '127.0.0.1';

  return new Promise((resolve, reject) => {
    let responseBody = '';
    const headers = {};
    const res = {
      statusCode: 200,
      headersSent: false,
      setHeader(name, value) {
        headers[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return headers[name.toLowerCase()];
      },
      removeHeader(name) {
        delete headers[name.toLowerCase()];
      },
      write(chunk) {
        if (chunk) responseBody += chunk.toString();
      },
      end(chunk) {
        this.headersSent = true;
        if (chunk) responseBody += chunk.toString();
        resolve({
          status: this.statusCode,
          headers,
          data: responseBody ? JSON.parse(responseBody) : null,
        });
      },
    };

    app.handle(req, res, reject);
  });
};

const mockAuthUsers = () => {
  patchMethod(User, 'findById', (id) => ({
    select: async () => ({
      _id: id,
      id,
      name: `User ${id}`,
      email: `${id}@example.com`,
      role: id === pmId ? 'PM' : 'Developer',
    }),
  }));
};

test('GET /api/tasks/:projectId returns project tasks for project members', async () => {
  mockAuthUsers();
  patchMethod(Project, 'findById', async (id) => ({
    _id: id,
    members: [memberId],
  }));
  patchMethod(Task, 'find', () => ({
    sort() {
      return this;
    },
    populate() {
      return this;
    },
    lean: async () => [{ _id: taskId, projectId, title: 'Scoped task' }],
    then(resolve) {
      return Promise.resolve(this.lean()).then(resolve);
    },
  }));

  try {
    const response = await request(`/api/tasks/${projectId}`, {
      token: makeToken(memberId, 'Developer'),
    });

    assert.equal(response.status, 200);
    assert.equal(response.data[0].title, 'Scoped task');
  } finally {
    restoreMethods();
  }
});

test('GET /api/tasks/:projectId blocks authenticated non-members', async () => {
  mockAuthUsers();
  patchMethod(Project, 'findById', async (id) => ({
    _id: id,
    members: [memberId],
  }));

  try {
    const response = await request(`/api/tasks/${projectId}`, {
      token: makeToken(outsiderId, 'Developer'),
    });

    assert.equal(response.status, 403);
  } finally {
    restoreMethods();
  }
});

test('PUT /api/tasks/:taskId/status rejects invalid status enum', async () => {
  mockAuthUsers();
  patchMethod(Task, 'findById', async () => ({
    _id: taskId,
    projectId,
    status: 'ongoing',
  }));
  patchMethod(Project, 'findById', async () => ({
    _id: projectId,
    members: [memberId],
  }));

  try {
    const response = await request(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      token: makeToken(memberId, 'Developer'),
      body: { status: 'blocked' },
    });

    assert.equal(response.status, 400);
    assert.match(response.data.message, /Validation failed/);
  } finally {
    restoreMethods();
  }
});

test('POST /api/tasks rejects assignees outside the project', async () => {
  mockAuthUsers();
  patchMethod(Project, 'findById', async () => ({
    _id: projectId,
    members: [memberId],
  }));

  try {
    const response = await request('/api/tasks', {
      method: 'POST',
      token: makeToken(pmId, 'PM'),
      body: {
        projectId,
        title: 'Create scoped task',
        assigneeId: outsiderId,
      },
    });

    assert.equal(response.status, 400);
    assert.match(response.data.message, /Assignee must be a member/);
  } finally {
    restoreMethods();
  }
});

test('POST /api/hourenso blocks Japanese client role before report creation', async () => {
  patchMethod(User, 'findById', (id) => ({
    select: async () => ({
      _id: id,
      id,
      role: 'Japanese client',
    }),
  }));

  try {
    const response = await request('/api/hourenso', {
      method: 'POST',
      token: makeToken(outsiderId, 'Japanese client'),
      body: {
        projectId,
        houkoku: {
          currentStatus: 'Reading',
          progress: 'N/A',
          issues: 'N/A',
          nextSteps: 'N/A',
        },
      },
    });

    assert.equal(response.status, 403);
  } finally {
    restoreMethods();
  }
});

test('POST /api/glossary rejects case-insensitive duplicate base terms', async () => {
  patchMethod(User, 'findById', (id) => ({
    select: async () => ({
      _id: id,
      id,
      role: 'BrSE',
    }),
  }));
  patchMethod(ITGlossary, 'findOne', async () => ({
    _id: '507f1f77bcf86cd799439041',
    baseTerm: 'API',
    normalizedBaseTerm: 'api',
  }));

  try {
    const response = await request('/api/glossary', {
      method: 'POST',
      token: makeToken(memberId, 'BrSE'),
      body: {
        baseTerm: 'api',
        translations: {
          en: 'Application Programming Interface',
          vi: 'Giao dien lap trinh ung dung',
          ja: 'API',
        },
      },
    });

    assert.equal(response.status, 400);
    assert.match(response.data.message, /already exists/);
  } finally {
    restoreMethods();
  }
});

test('POST /api/glossary/import imports valid spreadsheet rows and skips duplicates', async () => {
  patchMethod(User, 'findById', (id) => ({
    select: async () => ({
      _id: id,
      id,
      role: 'BrSE',
    }),
  }));
  patchMethod(ITGlossary, 'find', () => ({
    select: () => ({
      lean: async () => [{ normalizedBaseTerm: 'api' }],
    }),
  }));
  patchMethod(ITGlossary, 'insertMany', async (terms) => terms);

  try {
    const response = await request('/api/glossary/import', {
      method: 'POST',
      token: makeToken(memberId, 'BrSE'),
      body: {
        terms: [
          {
            baseTerm: 'API',
            translations: { en: 'Application Programming Interface', vi: 'API', ja: 'API' },
          },
          {
            baseTerm: 'Sprint',
            translations: { en: 'Sprint', vi: 'Sprint', ja: 'スプリント' },
          },
          {
            baseTerm: '',
            translations: { en: '', vi: '', ja: '' },
          },
        ],
      },
    });

    assert.equal(response.status, 201);
    assert.equal(response.data.imported, 1);
    assert.equal(response.data.skipped, 2);
  } finally {
    restoreMethods();
  }
});

test('POST /api/projects rejects invalid preferred language', async () => {
  mockAuthUsers();

  try {
    const response = await request('/api/projects', {
      method: 'POST',
      token: makeToken(pmId, 'PM'),
      body: {
        name: 'Language Preference Project',
        preferredLanguage: 'fr',
      },
    });

    assert.equal(response.status, 400);
    assert.match(response.data.message, /Validation failed/);
  } finally {
    restoreMethods();
  }
});

test('DELETE /api/projects/:projectId cascades tasks and reports for PM', async () => {
  mockAuthUsers();

  let tasksDeletedFor = null;
  let reportsDeletedFor = null;
  let projectDeleted = false;

  patchMethod(Project, 'findById', async () => ({
    _id: projectId,
    members: [memberId],
    deleteOne: async () => {
      projectDeleted = true;
    },
  }));
  patchMethod(Task, 'deleteMany', async (filter) => {
    tasksDeletedFor = filter.projectId;
    return { deletedCount: 2 };
  });
  patchMethod(HourensoReports, 'deleteMany', async (filter) => {
    reportsDeletedFor = filter.projectId;
    return { deletedCount: 1 };
  });

  try {
    const response = await request(`/api/projects/${projectId}`, {
      method: 'DELETE',
      token: makeToken(pmId, 'PM'),
    });

    assert.equal(response.status, 200);
    assert.equal(String(tasksDeletedFor), projectId);
    assert.equal(String(reportsDeletedFor), projectId);
    assert.equal(projectDeleted, true);
  } finally {
    restoreMethods();
  }
});

test('GET /api/tasks/:projectId returns 400 for malformed project ids', async () => {
  mockAuthUsers();

  try {
    const response = await request('/api/tasks/not-a-project-id', {
      token: makeToken(memberId, 'Developer'),
    });

    assert.equal(response.status, 400);
  } finally {
    restoreMethods();
  }
});
