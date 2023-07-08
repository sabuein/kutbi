"use strict";

// Role-based access control (RBAC) system

const roles = {
    ADMIN: "administrator",
    USER: "user",
    SUBSCRIBER: "subscriber",
    BASIC: "basic"
};

const rolePermissions = {
    [roles.ADMIN]: ["viewFreeContent", "viewPremiumContent", "createContent", "updateContent", "deleteContent", "manageApp"],
    [roles.USER]: ["viewFreeContent", "viewPremiumContent", "createContent", "updateContent", "deleteContent"],
    [roles.SUBSCRIBER]: ["viewFreeContent", "viewPremiumContent"],
    [roles.BASIC]: ["viewFreeContent"]
};

const checkPermission = (roles, permissions) => {
    return function (request, response, next) {
        const { userRoles, userPermissions } = request.user;
        if (roles.some(role => userRoles.includes(role)) && permissions.some(permission => userPermissions.includes(permission))) {
            // User has at least one of the specified roles and at least one of the specified permissions
            next();
        } else {
            request.status(403).json({ message: "Access denied" });
        }
    };
};


// checkPermission([roles.SUBSCRIBER, roles.ADMIN], ["", ""]);
// checkPermission([roles.SUBSCRIBER, roles.ADMIN], [""]);
  
export { roles, rolePermissions, checkPermission };