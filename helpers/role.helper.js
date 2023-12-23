function getGroupPriority() {
    return {
        presidente: 0,
        coord_regional: 1,
        coord_geral: 2
    }
}

function checkRole(user_role, test_role) {
    if (!test_role) return true;

    const priorities = getGroupPriority();

    const user_role_priority = priorities[user_role];
    const test_role_priority = priorities[test_role];

    return user_role_priority >= test_role_priority;
}

module.exports = {
    checkRole
}