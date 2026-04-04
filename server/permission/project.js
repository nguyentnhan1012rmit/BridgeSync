

const canViewProject = (user, project) => {
    return (
        user.role === "PM" ||
        project.members.id === user.id
    )
}

const scopedProject = (user, projects) => {
    if (user.role === "PM") return projects
    return projects.filter(project => {
        return project.members.some(member => member._id.toString() === user._id.toString());
    });
}

module.exports = {
    canViewProject,
    scopedProject
}