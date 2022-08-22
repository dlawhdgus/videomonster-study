const express = require('express');
const app = express();
const path = require('path')
const port = 3000;
const mysql = require('mysql')
const ejs = require('ejs')
const bodyParser = require('body-parser');
const url = require('url')

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('views','./public/views');
app.set('view engine', 'ejs');
// require('../project/public/views/index')(app);

const con = mysql.createConnection({
    host : 'localhost',
    user : 'jh',
    password : 'Jh728927!@',
    database : 'video',        //table name is login
    multipleStatements : false
})
// con.connect(function(err){
//     if(err) ''
//     console.log('sucess');
// });

//회원가입 
app.get('/',(req,res)=>{
    // res.render('index')
    res.status(200).send('index')
})

app.post('/',(req,res)=>{
    const addr = url.parse(req.url, false)
    console.log(addr)
    const { id: id, pw: pw} = req.body
    // var id = req.body.id; //id 받아오기
    // var pw = req.body.pw; //pw 받아오기
    if(!id || !pw){
        res.status(400).send('no value')
    }
    var delete_blank_id = id.replace(/(\s*)/g, ""); //공백 제거
    const check_id = `select count(*) as cnt from login where userid='${delete_blank_id}'`; //id 중복 확인
    con.query(check_id,function(err,result,fields){
        if(err) throw err;
        const count = result[0]['cnt']
        console.log(`count : ${count}`);
        if(id === ''){
            res.write("<script>alert('ID is blank');</script> ");
            res.write("<script>history.back();</script>");
        }
        else if(pw === ''){
            res.write("<script>alert('Password is blank');</script> ");
            res.write("<script>history.back();</script>");
        }
        else{
            if (count >= 1){
                res.write("<script>alert('ID is duplicated');</script> ");
                res.write("<script>history.back();</script>");
            }else{
                const sql = `INSERT INTO login (userid, userpw,reg_dt) VALUES ('${delete_blank_id}','${pw}',now())`;
                con.query(sql,[id,pw],function(err,result, fields){
                    if(err) throw err;
                    //console.log(result);
                    // res.redirect('/login');
                    res.status(200).send('login')
                }) 
            }
        }
    })
})

//로그인
app.get('/login',(req,res) =>{
    // res.render('login');
    res.status(200).send('login')
});

app.post('/login',(req,res)=>{
    const { id: post_id, pw: post_pw } = req.body  //구조 분해 할당

    if (!post_id || !post_pw) {
        res.status(400).send('Invalid Param')
    }

    const check_id = `select * from login where userid = '${post_id}'`;
    if(post_id === ''){
        res.write("<script>alert('Id is blank');</script>");
        res.write("<script>history.back();</script>");
    }
    else if (post_pw === ''){
        res.write("<script>alert('Password is blank');</script>");
        res.write("<script>history.back();</script>");
    }else{
        con.query(check_id,function(err,result,fields){
            if(err){throw err;}
            else{console.log(result);}
            
            // console.log(result)
            // console.log(result.length);
    
            if(result.length > 0)
            {
                const db_id = result[0]['userid'];
                const db_pw = result[0]['userpw'];
    
                // console.log(`id : ${db_id}`)
                // console.log(`pw : ${db_pw}`)
                // console.log(post_pw)
                // console.log(result[0].num)
                // res.send('sucess');
                if(db_id != post_id)
                {
                    res.write("<script>alert('Id not match');</script>");
                    res.write("<script>history.back();</script>");            
                }
                else if(db_pw != post_pw){
                    res.write('<script>alert("Password not match");</script>');
                    res.write("<script>history.back();</script>");
                }
                else
                {
                    console.log(result[0])
                    // res.redirect('/mypage');
                    // const mypage_sql = `SELECT * FROM login`
                    // con.query(mypage_sql, (err,result)=>{
                    //     con.query(`SELECT * FROM login WHERE userid = ${post_id}`,(err2,result2) => {
                    //         res.render('mypage',{login : result2})
                    //     })
                        
                    // })
                    res.status(200).send(result);
                    
                    
                }
            }
            else{
                res.write("<script>alert('check your id');script>");
                res.write("<script>history.back();</script>")
            }
        })
    }
})


//회원정보
app.get('/info',(req,res) =>{
    const sql = "select * from login";
    con.query(sql, function(err, result,fields){
        if(err) throw err;
        con.query(`SELECT * FROM login WHERE num = 7`,function(err2,result){
            if(err2) throw err2
            // res.render('info',{login : result})
            res.status(200).send(result)
        })
        // res.render('info',{login : result})
    });
});

//마이페이지
app.get('/mypage',(req,res) =>{
    const sql = `select num from login`; //where num = 그 회원의 num값을 가져오기
    con.query(sql, function(err, result,fields){
        if(err) {throw err}
        
        var i = 0 //rowdatapacket num값
        const num = result[i].num;
        con.query(`SELECT * FROM login WHERE num = ${num}`,function(err2,result2){
            if(err2) throw err2;
            // res.render('mypage',{login : result2})
            res.status(200).send(result2)
        })
        // res.render('mypage',{login : result})
    });
});


//기능
app.get('/create',(req, res)=>{
    // res.render('form');
    res.status(200).send('form')
})

app.get('/edit/:num', (req, res) =>{
    const sql = `SELECT * FROM login`;
    con.query(sql, [req.params.id],function(err,result,fields){
        if(err) throw err;
        var i = 1 //rowdatapacket num값
        const num = result[i].num;
        con.query(`SELECT * FROM login WHERE num = ${num}`,function(err2,result2){
            // res.render('edit',{login : result2})
            res.status(200).send({result2})
        })
        //res.render('edit',{login : result});
        res.status(200).send({result})

    })
})
app.post('/update/:userid',(req,res)=>{
    const sql = `UPDATE login SET ?`;
    con.query(sql,req.body,function(err,result,fields){
        if(err) throw err;
        //res.redirect('/info');
        res.status(200).send('info')
    })
    /*
    const update_id_sql = `Update login SET userid = '${return_value}' where userid='${basic_value}'`
    const update_pw_sql = `Update login SET userpw = '${return_value}' where userpw='${basic_value}'`
    var o = useridischanged
    if(o){
        con.query(update_id_sql,function(err,result,fields){
            if(err) throw err;

        })
    }
    else{
        con.query(update_pw_sql,function(err,result,fields){
            if(err) throw err;
        })
    }
    */
})
app.get('/delete/:id', (req,res)=>{
    const sql = `DELETE FROM login WHERE userid = '${req.params.id}'`;
    con.query(sql,[req.params.id],function(err,result,fields){
        if(err) throw err;
        // res.redirect('/info');
        res.status(200).send('info')
    })
})

app.listen(port,()=>{
    console.log('server start');
})
