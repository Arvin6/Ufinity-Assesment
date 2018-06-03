import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';

import schemas from '../app/config/schema'
import server from '../app';
import queryBuilder from '../app/db';
import constant from '../app/config/config';

chai.use(chaiHttp);

let valid_student = 'teststudent@school2.com';
let valid_student2 = 'teststudent2@school2.com';
let valid_teacher = 'testteacher@school2.com';

describe('Register students to teacher /api/register', () => {
    // Push data before use
    before(async (done)=> {
        new queryBuilder().insert(constant.tables.student).execute(
                [[schemas.students.mail, schemas.students.isSuspended], [valid_student, false]],
                function(err, res){
                    if (err) throw err;
        });
        new queryBuilder().insert(constant.tables.student).execute(
            [[schemas.students.mail, schemas.students.isSuspended], [valid_student2, false]],
            function(err, res){
                if (err) throw err;
        })
        new queryBuilder().insert(constant.tables.teacher).execute(
            [schemas.teachers.mail, valid_teacher],
            function(err, res){
                if (err) throw err;    
        });
        done();
    })
    
    // Clear the data after use
    after((done) => {
        new queryBuilder().delete(constant.tables.register).execute(null, function(err, res){
            if (err) throw err;});
        new queryBuilder().delete(constant.tables.student).execute(null, function(err, res){
            if (err) throw err;});
        new queryBuilder().delete(constant.tables.teacher).execute(null, function(err, res){
            if (err) throw err;});
        done();
    })

    it('Register non-existing student to teacher - Return 400', (done)=>{
        let data = {
            'teacher': 'teacherclaire@school1.com',
            'students': [
            'jackmiller@school1.com'
            ]}
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err, null);
                chai.expect(res.status, 400);
                chai.expect(res.body instanceof Object);
                chai.expect(res.body.errors === `Student ${data.students[0]} does not exist`)
                done();
            })
        })
    it('Register valid student to non-existing teacher', (done) => {
        let data = {
            'teacher': 'teacherX@school1.com',
            'students': [valid_student]
        }
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err, null);
                chai.expect(res.status, 400);
                chai.expect(res.body instanceof Object);                    
                chai.expect(res.body.errors === `Teacher ${data.teacher} does not exist.`)
                done();
            })
        })
    it('Register multiple invalid students to valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': [
            'jackmiller@school1.com',
            'jaymill@school1.com'
        ]}
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err, null);
                chai.expect(res).to.have.a.property('status', 400);
                chai.expect(res.body instanceof Object);                    
                chai.expect(res.body.errors === `Student ${data.students[0]} does not exist.`)
                done();            
            })
    })    
    it('Register valid student to valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': [
                valid_student
        ]}
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err, null);
                chai.expect(res).to.have.a.property('status',204);
                chai.expect(res.body).to.be.empty;                    
                done();            
            })
    })
    it('Register multiple valid students to valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': [
                valid_student, valid_student2
        ]}
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',204);
                chai.expect(res.body).to.be.empty;                    
                done();            
            })
    })
    it('Reject invalid mail format - teacher', (done) => {
        let data = {
            'teacher': 'invalid_teacher_mail',
            'students': [
                valid_student, valid_student2
        ]}
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.property('errors','Invalid mail format '+data.teacher);                  
            })
            done();            
    })
    it('Reject invalid mail format - student', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': [
                valid_student, 'invalid_mailformat'
        ]}
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.property('errors','Invalid mail format '+data.students[1]);                  
            })
            done();            
    })
    it('Register a valid student to a valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': valid_student
            }
        chai.request(server)
            .post('/api/register')
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.a.property('errors','Expected an array of students.');                    
                done();            
            })
    })
    
});

describe('/api/suspend', () => {
    // Push data before use
    before(async (done)=> {
        new queryBuilder().insert(constant.tables.student).execute(
                [[schemas.students.mail, schemas.students.isSuspended], [valid_student, true]],
                function(err, res){
                    if (err) throw err;
        });
        new queryBuilder().insert(constant.tables.student).execute(
            [[schemas.students.mail, schemas.students.isSuspended], [valid_student2, false]],
            function(err, res){
                if (err) throw err;
        })
        new queryBuilder().insert(constant.tables.teacher).execute(
            [schemas.teachers.mail, valid_teacher],
            function(err, res){
                if (err) throw err;    
        });
        done();
    })
    
    // Clear the data after use
    after((done) => {
        new queryBuilder().delete(constant.tables.register).execute(null, function(err, res){
            if (err) throw err;});
        new queryBuilder().delete(constant.tables.student).execute(null, function(err, res){
            if (err) throw err;});
        new queryBuilder().delete(constant.tables.teacher)
            .execute(null, function(err, res){
                if (err) throw err;});
        done();
    })

    it('Suspend non existing students', (done)=>{
        let data = {
            'student': valid_student2
        };
        chai.request(server)
            .post('/api/suspend')
            .send(data)
            .end((err, res)=>{
                console.log(err, res.body);
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',204);
                chai.expect(res.body).to.be.empty;                    
                done();            
            })
    })
    it('Suspend already suspended students', (done)=>{
        let data = {
            'student': valid_student
        };
        chai.request(server)
            .post('/api/suspend')
            .send(data)
            .end((err, res)=>{
                console.log(err, res.body);
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.a.property('errors',data.student+' is already suspended.');                    
                done();            
            })
    })
})