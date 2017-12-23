export const isAdmin = _ => 
  !!document.roles.find(role => role.permission === 'admin')

export const isManager = _ =>
  !!document.roles.find(role => role.permission === 'manager')

export const isManagerOfDepartment = departmentId => 
  !!document.roles.find(role => role.departmentId === departmentId && role.permission === 'manager')

export const isVolunteer = _ =>
  !!document.roles.find(role => role.permission === 'volunteer')

export const isVolunteerOfDepartment = departmentId => 
  !!document.roles.find(role => role.departmentId === departmentId && role.permission === 'volunteer')