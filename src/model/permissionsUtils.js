export const isAdmin = _ => 
  !!document.permissions.roles.find(role => role.permission === 'admin')

export const isManager = _ =>
  !!document.permissions.roles.find(role => role.permission === 'manager')

export const isManagerOfDepartment = departmentId => 
  !!document.permissions.roles.find(role => role.departmentId === departmentId && role.permission === 'manager')

export const isVolunteer = _ =>
  !!document.permissions.roles.find(role => role.permission === 'volunteer')

export const isVolunteerOfDepartment = departmentId => 
  !!document.permissions.roles.find(role => role.departmentId === departmentId && role.permission === 'volunteer')