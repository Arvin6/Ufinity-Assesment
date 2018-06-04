import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';

import schemas from '../app/config/schema'
import server from '../app';
import queryBuilder from '../app/db';
import constant from '../app/config/config';

chai.use(chaiHttp);

let endpoint = '/api/retrievefornotifications/'


let valid_teacher1 = 'testteacher1@school2.com'
let valid_teacher2 = 'testteacher2@school2.com'

let valid_student1 = 'teststudent5@school2.com';
// let valid_student2 = 'teststudent6@school2.com';
// let valid_student3 = 'teststudent7@school2.com';
// let valid_student4 = 'teststudent8@school2.com';
// let valid_teacher1 = 'testteacher3@school2.com';
// let valid_teacher2 = 'testteacher4@school2.com';

describe(' Retrieve notification - /api/retrievefornotification', () => {
        before( (done)=> {
            // new queryBuilder().update(constant.tables.student).execute(
            //         [[schemas.students.mail, schemas.students.isSuspended], [valid_student1, true]],
            //         function(err, res){
            //             if (err) throw err;
            // });
            // new queryBuilder().upadte(constant.tables.student).execute(
            //     [[schemas.students.mail, schemas.students.isSuspended], [valid_student2, false]],
            //     function(err, res){
            //         if (err) throw err;
            // });
            // new queryBuilder().upadte(constant.tables.student).execute(
            //     [[schemas.students.mail, schemas.students.isSuspended], [valid_student3, false]],
            //     function(err, res){
            //         if (err) throw err;
            // });
            // new queryBuilder().upadte(constant.tables.student).execute(
            //     [[schemas.students.mail, schemas.students.isSuspended], [valid_student4, false]],
            //     function(err, res){
            //         if (err) throw err;
            // });
            // new queryBuilder().update(constant.tables.teacher).execute(
            //     [schemas.teachers.mail, valid_teacher1],
            //     function(err, res){
            //         if (err) throw err;    
            // });

            // new queryBuilder().update(constant.tables.teacher).execute(
            //     [schemas.teachers.mail, valid_teacher2],
            //     function(err, res){
            //         if (err) throw err;    
            // });
            done();
        })

    it('Ignore if @mentioned / registered student is blocked', (done) => { 
        let data = {
            'teacher': valid_teacher1,
            'notification': 'I want @teststudent2@school2.com to meet me now.'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.recipients).to.be.an('array');
                chai.expect(res.body.recipients).to.deep.equal(['teststudent2@school2.com', 'teststudent1@school2.com']);                                                  
                done();            
            })
    })

    it('Respond with registered students with the @mentions if mentioned student exists', (done)=>{
        let data = {
            'teacher': valid_teacher2,
            'notification': 'I want @teststudent2@school2.com to meet me now.'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.recipients).to.be.an('array');
                chai.expect(res.body.recipients).to.deep.equal(['teststudent2@school2.com']);                                                  
                done();            
            });
    })

    it('Respond with only valid @mentioned students if no student has registered', (done)=>{
        let data = {
            'teacher': valid_teacher2,
            'notification': 'I want @teststudent2@school2.com to meet me now.'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.recipients).to.be.an('array');
                chai.expect(res.body.recipients).to.deep.equal(['teststudent2@school2.com']);                                                  
                done();            
            });
    })

    it('Respond with [] if no student has registered and mentions are non existing student mail', (done)=>{
        let data = {
            'teacher': valid_teacher2,
            'notification': 'I want @teststudent2004@school2.com to meet me now.'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.recipients).to.be.an('array').that.is.empty;
                chai.expect(res.body.recipients).to.deep.equal([]);                                                  
                done();
            });
    })

    it('Validate teacher mail', (done) => { 
        let data = {
            'teacher': 'invalid_mailI@.',
            'notification': 'I want @teststudent2@school2.com to meet me now.'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.errors).to.deep.equal(`Teacher mail ${data.teacher} is invalid.`);                                              
                done();            
            })
    })


    it('Notification field is required', (done) => { 
        let data = {
            'teacher': 'invalid_mailI@.',
            'notification': ''
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.errors).to.deep.equal(`Notification cannot be empty.`);                                              
                done();            
            })
    })

})