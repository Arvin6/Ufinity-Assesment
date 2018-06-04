import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';

import schemas from '../app/config/schema'
import server from '../app';
import queryBuilder from '../app/db';
import constant from '../app/config/config';

let endpoint = '/api/register'
chai.use(chaiHttp);

let valid_student = 'teststudent1@school2.com';
let valid_student2 = 'teststudent2@school2.com';
let valid_student3 = 'teststudent3@school2.com'
let valid_teacher = 'testteacher1@school2.com';
let valid_teacher3 = 'testteacher3@school2.com';

let ids_to_delete = [];
describe('Register students to teacher /api/register', () => {
    // Push data before use
    before((done)=> {
        // new queryBuilder().insert(constant.tables.student).execute(
        //         [[schemas.students.mail, schemas.students.isSuspended], [valid_student, false]],
        //         function(err, res){
        //             if (err) throw err;
        // });
        // new queryBuilder().insert(constant.tables.student).execute(
        //             [[schemas.students.mail, schemas.students.isSuspended], [valid_student3, true]],
        //             function(err, res){
        //                 if (err) throw err;
        //     });
        // new queryBuilder().insert(constant.tables.student).execute(
        //     [[schemas.students.mail, schemas.students.isSuspended], [valid_student2, false]],
        //     function(err, res){
        //         if (err) throw err;
        // })
        // new queryBuilder().insert(constant.tables.teacher).execute(
        //     [schemas.teachers.mail, valid_teacher],
        //     function(err, res){
        //         if (err) throw err;    
        // });
        // new queryBuilder().insert(constant.tables.teacher).execute(
        //     [schemas.teachers.mail, valid_teacher3],
        //     function(err, res){
        //         if (err) throw err;    
        // });
        done();
    })

    it('Register multiple valid students to valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': [
                valid_student, valid_student2
        ]}
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.be.at.most(204);    
                done();            
            })
    })

    it('Register already existing relations', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': [
                valid_student,
                valid_student2
        ]}
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err, null);
                chai.expect(res.status).to.be.at.most(204);
                chai.expect(res.body instanceof Object);
                chai.expect(res.body.ignored).deep.equal([`Student ${valid_student} is already registered to ${valid_teacher}`, `Student ${valid_student2} is already registered to ${valid_teacher}`]);
                done();            
            })
    })  
    
    it('Register valid student to different valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher3,
            'students': [
                valid_student
        ]}
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err, null);
                chai.expect(res.status).to.be.at.most(204);  
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
            .post(endpoint)
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
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.property('errors','Invalid mail format '+data.students[1]);                  
            })
            done();            
    })

    it('Register a valid student as string to a valid teacher', (done) => {
        let data = {
            'teacher': valid_teacher,
            'students': valid_student
            }
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.a.property('errors','Expected an array of students.');                    
                done();            
            })
    })
    
});
