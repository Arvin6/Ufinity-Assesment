import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';

import schemas from '../app/config/schema'
import server from '../app';
import queryBuilder from '../app/db';
import constant from '../app/config/config';

let endpoint = '/api/suspend';
chai.use(chaiHttp);

let valid_student = 'teststudent3@school2.com';
let valid_student2 = 'teststudent4@school2.com';


describe('Suspend student - /api/suspend', () => {
    // Push data before use
    // before((done)=> {
    //Caution: Uncomment only if you need to populate the DB, or it may cause unnecessary failures
        // new queryBuilder().insert(constant.tables.student).execute(
        //     [[schemas.students.mail, schemas.students.isSuspended], [valid_student2, false]],
        //     function(err, res){
        //         if (err) throw err;
        // })
    //     done();
    // })
    
    after((done)=>{
        // Un-suspend the suspended student for next run
    new queryBuilder().update(constant.tables.student, schemas.students.isSuspended, 0)
                        .where()
                        .execute(
                            [schemas.students.mail, valid_student2],
                            function(err, res){
                                if (err) {throw err.sql};
                            })
    done();        
})

    it('Suspend valid student', (done)=>{
        let data = {
            'student': valid_student2
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',200);
                chai.expect(res.body).to.be.an("object").that.has.a.property('message',`Suspended ${valid_student2}`);                    
                done();            
            })
    })
    it('Suspend already suspended student', (done)=>{
        let data = {
            'student': valid_student
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.a.property('errors',data.student+' is already suspended.');                    
                done();            
            })
    })
    it('Suspend a student who doesnt exist', (done)=>{
        let data = {
            'student': 'abc@cmail.com'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.a.property('errors',`Student ${data.student} does not exist.`);                    
                done();            
            })
    })

    it('Suspend a student with invalid mail format', (done)=>{
        let data = {
            'student': 'invalid_mail@format'
        };
        chai.request(server)
            .post(endpoint)
            .send(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res).to.have.a.property('status',400);
                chai.expect(res.body).to.be.an('object').that.has.a.property('errors',`Student mail ${data.student} is invalid.`);                    
                done();            
            })
    })
})