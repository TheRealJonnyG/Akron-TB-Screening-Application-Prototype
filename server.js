const express = require('express');
const oracledb = require('oracledb');

const { createTransport } = require('nodemailer');

const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: "jrg162@uakron.edu",
        pass: "xsmtpsib-ac3afd5d1684180040b7a51e06fc954062d0842253cc87284e8294263f59e6d3-n21CaX9rxpJFSA58",

    },
});
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/getNameById', async (req, res) => {
    console.log('GET request received at /getNameById');
    let conn;
    try {
        conn = await oracledb.getConnection({
            user: "ADMIN",
            password: 'WeL0vePureLungs',
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        });

        const result = await conn.execute('SELECT FIRST_NAME FROM students WHERE ID = 1');
        await conn.commit();

        res.json({ name: result.rows[0][0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
});

getCreds = async(pass, user, con) =>{
    try{
        const creds = await con.execute('SELECT FIRST_NAME, USERNAME, PASSWORD FROM STUDENTS WHERE USERNAME = ' + "'" + user + "'" + ' AND PASSWORD = ' + "'" + pass + "'")

    } catch (error){
    console.error(error);
    res.status(500).json({error:'Bad Login'})
    }
}

app.get('/getCredentials', async (req, res) => {
    let conn;

    console.log('GET Static cred receieved')
    try{
        conn = await oracledb.getConnection({
            user: "ADMIN",
            password: 'WeL0vePureLungs',
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        });
        const user = req.query.user
        const pass = req.query.pass

        const query = 'SELECT FIRST_NAME, EMAIL, ID FROM STUDENTS WHERE USERNAME = ' + "'" + user + "'" + ' AND PASSWORD = ' + "'" + pass + "'"
        const creds = await conn.execute(query)
        const name = creds.rows[0][0]
        const email = creds.rows[0][1]
        const id = creds.rows[0][2]
        const checkResp = await conn.execute('SELECT COUNT(*) FROM SURVEYRESPONSE WHERE STUDENT_ID = ' + id)
        const check = checkResp.rows[0][0]
        res.json({
            name: name,
            email: email,
            id : id,
            resp : check
        })

    }   catch (error){
            console.error(error);
            res.status(500).json({error:'Internal Server Error'});
        } finally {
            if (conn) {
                try {
                    await conn.close();
                } catch (error) {
                    console.error(error);
                }
            }
        }

})

app.get('/getStaticValues', async (req, res) => {
    console.log('GET Static req receieved');
    let conn;
    try{
        conn = await oracledb.getConnection({
            user: "ADMIN",
            password: 'WeL0vePureLungs',
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        });
        const countries = await conn.execute('SELECT Name, AUTOTEST FROM countries ORDER BY NAME')
        let countriesJson = [];
        let autoTest = [];
        for(i = 0; i < countries.rows.length; i++){
            let country = {
                name: countries.rows[i][0],
                autotest: countries.rows[i][1]
            };
            countriesJson.push(country)
        }

        res.json({
            countries : countriesJson
        })

    } catch (error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
    
})

populateTemplate = (html, replacements) =>{
    Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp('\\${' + placeholder + '}', 'g');
        html = html.replace(regex, value);
    });
    return html;
}

app.get('/notifyHealthcare', async (req, res) => {
    const SID = req.query.SID
    const text = "Student at ID: " + SID + " has completed their survey."
    const mailOptions = {
        from: 'jrg162@uakron.edu',
        to: 'jgrahaminquiry@gmail.com',
        subject: 'Student completed survey',
        text: text,
    };
    transporter.sendMail(mailOptions)
    res.json({
        success : "success"
    })
})

app.get('/sendEmail', async (req, res) => {
    
    try{
        conn = await oracledb.getConnection({
            user: "ADMIN",
            password: 'WeL0vePureLungs',
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        })
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate())
        const submitDate = currentDate.toISOString().split('T')[0]
        const bigDate = new Date()
        bigDate.setDate(bigDate.getDate() + 7)
        const date = bigDate.toISOString().split('T')[0]
        const studentEmailID = req.query.SEID
        const SID = req.query.SID
        const sEmail = req.query.SE 
        const name = req.query.SN
        const htmlQ = await conn.execute("SELECT * FROM EMAILTEMPLATE WHERE EMAIL_ID = '" + studentEmailID + "'")
        const rawHtml = htmlQ.rows[0][3]
        const html = populateTemplate(rawHtml,{name,date})
        const subject = htmlQ.rows[0][2]
        const mailOptions = {
            from: 'jrg162@uakron.edu',
            to: sEmail,
            subject: subject,
            html: html,
        };
        transporter.sendMail(mailOptions, async function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent ' + info.response);
                try{
                    conn = await oracledb.getConnection({user:"ADMIN", password:'WeL0vePureLungs', connectString:"(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"})
                    conn.execute('INSERT INTO EMAILTRACKING (Student_email_id, STUDENT_ID, DateSent) VALUES ('+ "'" + studentEmailID  + "','" + SID + "'," + "TO_DATE('" + submitDate + "', 'YYYY-MM-DD'))" )
                    await conn.commit(); 

                    res.json({
                        success : "success"
                    })
                    
                } catch (err){
                    console.error(err)
                } finally {
                    if (conn) {
                        try{
                            await conn.close
                        }catch (err){
                            console.error(err);
                        }
                    } 
                }
            }
        });


    } catch (error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    } finally {
        if (conn) {
            try {
                console.log("xd")
                await conn.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
})

app.get('/submitSurvey', async (req,res) => {
    try{
        conn = await oracledb.getConnection({
            user: "ADMIN",
            password: 'WeL0vePureLungs',
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        })
        const SID = req.query.SID
        const surveyQuestionID = req.query.SQID
        const answer = req.query.Q
        const d  = new Date()
        d.setDate(d.getDate())
        const submitDate = d.toISOString().split('T')[0]

        await conn.execute('INSERT INTO SURVEYRESPONSE (STUDENT_ID,STUDENTSURVEYQUESTION_ID,RESPONSE,DATEOFRESPONSE) VALUES (' + SID + ",'" + surveyQuestionID + "','" + answer + "', TO_DATE('" + submitDate +"', 'YYYY-MM-DD'))")

        await conn.commit()

        res.json({
            success : "success"
        })
    } catch (error){
        console.error(error);
        res.status(500).json({error:'Internal Server Error'});
    } finally {
        if (conn) {
            try {
                console.log("xd")
                await conn.close();
            } catch (error) {
                console.error(error);
            }
        }
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



