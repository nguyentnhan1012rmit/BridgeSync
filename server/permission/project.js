const canViewProject = (user, project) => {
    if (!user || !project) return false;
    if (user.role === "PM") return true;

    const userId = user._id?.toString?.() || user.id?.toString?.();
    const members = Array.isArray(project.members) ? project.members : [];

    return (
        Boolean(userId) &&
        members.some(member => {
            const memberId = member._id?.toString?.() || member.toString?.();
            return memberId === userId;
        })
    );
}

const scopedProject = (user, projects) => {
    if (user.role === "PM") return projects
    return projects.filter(project => {
        return canViewProject(user, project);
    });
}

module.exports = {
    canViewProject,
    scopedProject
}
