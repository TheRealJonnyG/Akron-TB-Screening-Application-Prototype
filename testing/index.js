let express = require("express");
let app = express();

app.get("/", (req,res) => {
    res.send("s")
})

app.listen(3000);


/*const oracledb = require('oracledb');
oracledb.outFormat = oracldedb.OUT_FORMAT_OBJECT;

async function fun() {
    let con;

    try{
        con = await oracldedb.getConnection({
            user          : "ADMIN",
            password      : "WeL0vePureLungs",
            connectString : "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
        });

        const data = await con.execute(
            'SELECT FIRST_NAME FROM students WHERE ID = 1;',
        );
        console.log(data.rows);
        
    } catch (err) {
        console.error(err);
    }
}
fun();


const { createTransport } = require('nodemailer');

const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: "jrg162@uakron.edu",
        pass: "xsmtpsib-ac3afd5d1684180040b7a51e06fc954062d0842253cc87284e8294263f59e6d3-n21CaX9rxpJFSA58",

    },
});

const mailOptions = {
    from: 'jrg162@uakron.edu',
    to: 'applfritter@gmail.com',
    subject: data,
    text: 'Who said it?'
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    } else{
        console.log('Email sent ' + info.response);
    }
});
*/
