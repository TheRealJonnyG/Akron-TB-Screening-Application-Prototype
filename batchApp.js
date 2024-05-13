const oracledb = require('oracledb');



// Nodemailer specifications for brevo
const { createTransport } = require('nodemailer');

const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: "jrg162@uakron.edu",
        pass: "xsmtpsib-ac3afd5d1684180040b7a51e06fc954062d0842253cc87284e8294263f59e6d3-n21CaX9rxpJFSA58",

    },
});


// For putting the proper info (name, date etc...) inside the html templates
populateTemplate = (html, replacements) =>{
    Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp('\\${' + placeholder + '}', 'g');
        html = html.replace(regex, value);
    });
    return html;
}

// Filter students to only current ones so we dont send emails to old students
getIncomingStudents = async() => {
    let successfulSent = false
    let semester = null
    const currentDate = new Date()
    const year = currentDate.getFullYear();
    const dateToday = new Date(year, currentDate.getMonth(), currentDate.getDate())

    const springStart = new Date(year, 0, 1);  // January 1
    const springEnd = new Date(year, 4, 31);   // May 31

    const summerStart = new Date(year, 5, 1);  // June 1
    const summerEnd = new Date(year, 7, 31);   // August 31

    const fallStart = new Date(year, 8, 1);    // September 1
    const fallEnd = new Date(year, 11, 31);    // December 31

    // Check current date against semester ranges
    if (dateToday >= springStart && dateToday <= springEnd) {
        semester = "SPRING"
    } else if (dateToday >= summerStart && dateToday <= summerEnd) {
        semester = "SUMMER"
    } else if (dateToday >= fallStart && dateToday <= fallEnd) {
        semester = "FALL"
    } else {
        return 'Semester not found'; 
    }
    let semYear = semester + year
    let conn;
    try{
        conn = await oracledb.getConnection({user:"ADMIN", password:'WeL0vePureLungs', connectString:"(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=g9f7ee66e89fc6b_j5t04z4gllfdexkf_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"})
        let students = []
        let studentsToEmail = await conn.execute('SELECT a.ID, a.FIRST_NAME, a.EMAIL FROM STUDENTS a WHERE a.STUDENT_SEMESTER = ' + "'"+semYear+"'" + " AND a.ID NOT IN (SELECT b.student_ID FROM SURVEYRESPONSE b)")
        console.log(studentsToEmail.rows.length + " students who have not filled out surveys to email from this semester")
        let emailTemp = null
        for(let i = 0; i < studentsToEmail.rows.length; i++){
            let emailTemplateCheck = await conn.execute('SELECT COUNT(*) FROM EMAILTRACKING WHERE STUDENT_ID = ' + studentsToEmail.rows[i][0])
            if(emailTemplateCheck.rows[0][0] === 0){
                emailTemp = await conn.execute("SELECT * FROM EMAILTEMPLATE WHERE EMAIL_ID = 'ST101'")
                students.push({
                    id : studentsToEmail.rows[i][0],
                    fName : studentsToEmail.rows[i][1],
                    email : studentsToEmail.rows[i][2],
                    subject : emailTemp.rows[0][2],
                    html : emailTemp.rows[0][3],
                    template : emailTemp.rows[0][0],
                })
                console.log("SID: " + studentsToEmail.rows[i][0] + " - Sending First email to " + studentsToEmail.rows[i][1])
            } else if (emailTemplateCheck.rows[0][0] > 0 && emailTemplateCheck.rows[0][0] < 9){
                emailTemp = await conn.execute("SELECT * FROM EMAILTEMPLATE WHERE EMAIL_ID = 'ST102'") 
                students.push({
                    id : studentsToEmail.rows[i][0],
                    fName : studentsToEmail.rows[i][1],
                    email : studentsToEmail.rows[i][2],
                    subject : emailTemp.rows[0][2],
                    html : emailTemp.rows[0][3],
                    template : emailTemp.rows[0][0],
                })
                console.log("SID: " + studentsToEmail.rows[i][0] + " - Sending Reminder email to " + studentsToEmail.rows[i][1])
            } else if (emailTemplateCheck.rows[0][0] === 9){
                emailTemp = await conn.execute("SELECT * FROM EMAILTEMPLATE WHERE EMAIL_ID = 'ST103'")
                students.push({
                    id : studentsToEmail.rows[i][0],
                    fName : studentsToEmail.rows[i][1],
                    email : studentsToEmail.rows[i][2],
                    subject : emailTemp.rows[0][2],
                    html : emailTemp.rows[0][3],
                    template : emailTemp.rows[0][0],
                })
                console.log("SID: " + studentsToEmail.rows[i][0] + " - Sending Final email to " + studentsToEmail.rows[i][1])
            }   else {
                console.log("SID: " + studentsToEmail.rows[i][0] + " - Max emails already sent to "  + studentsToEmail.rows[i][1])
            }
        }

        await conn.commit(); 

        return students
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



sendEmail = async() => {
    try {
        const students = await getIncomingStudents();
        await students.forEach(student => {
            const bigDate = new Date()
            const current = new Date()
            current.setDate(current.getDate())
            bigDate.setDate(bigDate.getDate() + 7)
            const date = bigDate.toISOString().split('T')[0]
            const theDate = current.toISOString().split('T')[0]
            const name = student.fName
            const sEmail = student.email
            const subject = student.subject
            const rawHtml = student.html
            const template = student.template
            const id = student.id
            

            const html = populateTemplate(rawHtml,{name,date})
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
                        conn.execute('INSERT INTO EMAILTRACKING (Student_email_id, STUDENT_ID, DateSent) VALUES ('+ "'" + template + "','" + id + "'," + "TO_DATE('" + theDate + "', 'YYYY-MM-DD'))" )
                        await conn.commit(); 
                
                        return students
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
        })
    } catch (err) {
        console.error(err);
    }
}

sendEmail();
