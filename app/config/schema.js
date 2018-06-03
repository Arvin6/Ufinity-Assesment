var schemas = {
    teachers: {
        id : "id",
        mail: "mail"
    },
    students: {
        id: "id",
        mail: "mail",
        isSuspended: "isSuspended"
    },
    registration: {
        teacher_id: "teacher_id",
        student_id: "student_id"
    }
}

module.exports = schemas