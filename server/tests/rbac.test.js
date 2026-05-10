const test = require('node:test');
const assert = require('node:assert/strict');
const { authorize } = require('../middleware/authMiddleware');
const { authGetProject } = require('../middleware/projectMiddleware');
const { canViewProject, scopedProject } = require('../permission/project');

const memberId = '507f1f77bcf86cd799439011';
const otherId = '507f1f77bcf86cd799439012';
const project = {
  members: [{ _id: memberId }],
};

const mockResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

test('canViewProject allows PMs and project members', () => {
  assert.equal(canViewProject({ role: 'PM', _id: otherId }, project), true);
  assert.equal(canViewProject({ role: 'Developer', _id: memberId }, project), true);
});

test('canViewProject supports string member ids from unpopulated documents', () => {
  assert.equal(
    canViewProject({ role: 'Developer', _id: memberId }, { members: [memberId] }),
    true
  );
});

test('canViewProject rejects non-members', () => {
  assert.equal(canViewProject({ role: 'Developer', _id: otherId }, project), false);
});

test('scopedProject only returns member projects for non-PMs', () => {
  const visible = scopedProject(
    { role: 'Developer', _id: memberId },
    [project, { members: [{ _id: otherId }] }]
  );

  assert.equal(visible.length, 1);
  assert.deepEqual(visible[0], project);
});

test('authorize middleware blocks disallowed roles', () => {
  const req = { user: { role: 'Developer' } };
  const res = mockResponse();
  let nextCalled = false;

  authorize('PM')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test('authorize middleware allows permitted roles', () => {
  const req = { user: { role: 'PM' } };
  const res = mockResponse();
  let nextCalled = false;

  authorize('PM')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test('project access middleware blocks non-members', () => {
  const req = { user: { role: 'Developer', _id: otherId }, project };
  const res = mockResponse();
  let nextCalled = false;

  authGetProject(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test('project access middleware allows project members', () => {
  const req = { user: { role: 'Developer', _id: memberId }, project };
  const res = mockResponse();
  let nextCalled = false;

  authGetProject(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test('project access middleware allows PMs even when they are not members', () => {
  const req = { user: { role: 'PM', _id: otherId }, project };
  const res = mockResponse();
  let nextCalled = false;

  authGetProject(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});
