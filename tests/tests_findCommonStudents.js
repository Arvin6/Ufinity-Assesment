import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';

import schemas from '../app/config/schema'
import server from '../app';
import queryBuilder from '../app/db';
import constant from '../app/config/config';

chai.use(chaiHttp);

let endpoint = '/api/commonstudents/'

let valid_teacher1 = 'testteacher1@school2.com'
let valid_teacher2 = 'testteacher3@school2.com'

let valid_common = 'teststudent1@school2.com'

describe('Find common students', ()=> {

    it('Find common students between valid teachers',(done)=>{
        let data = {
            'teacher': [valid_teacher2,valid_teacher1]
        };
        chai.request(server)
            .get(endpoint)
            .query(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.students).to.be.an('array');
                chai.expect(res.body.students).to.deep.equal(['teststudent1@school2.com']);                                                  
                done();            
            })
    })

    it('Reject invalid teacher mails',(done)=>{
        let data = {
            'teacher': ['invalid_teacher2', valid_teacher1]
        };
        chai.request(server)
            .get(endpoint)
            .query(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.errors).to.deep.equal(`Teacher mail ${data.teacher[0]} is invalid.`);                                   
                done();            
            })
    })

    it('Reject non-existing teacher mail ids',(done)=>{
        let data = {
            'teacher': ['invalid_teacher2@gmail.com']
        };
        chai.request(server)
            .get(endpoint)
            .query(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.errors).to.deep.equal(`Teacher ${data.teacher[0]} does not exist.`);                                   
                done();            
            })
    })

    it('Accept non-list i.e, single teacher (mail) values',(done)=>{
        let data = {
            'teacher': valid_teacher1
        };
        chai.request(server)
            .get(endpoint)
            .query(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(200);
                chai.expect(res.body.students).to.be.an('array');
                chai.expect(res.body.students).to.deep.equal(['teststudent1@school2.com', 'teststudent2@school2.com']);                                   
                done();            
            })
    })

    it('Reject blank teacher mail ids',(done)=>{
        let data = {
            'teacher': ''
        };
        chai.request(server)
            .get(endpoint)
            .query(data)
            .end((err, res)=>{
                chai.expect(err).to.be.null;
                chai.expect(res.status).to.equal(400);
                chai.expect(res.body.errors).to.deep.equal(`Field teacher cannot be empty.`);                                   
                done();            
            })
    })

})
