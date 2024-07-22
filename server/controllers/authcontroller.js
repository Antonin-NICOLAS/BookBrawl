const User = require('../models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const test = (req, res) => {
    res.json('server is working');
}

//register
const registerUser = async (req, res) => {
    try {
        const { prenom, nom, email, password } = req.body;

        if (!nom) {
            return res.json({ error: "Le nom est requis" });
        }
        if (!password || password.length < 6) {
            return res.json({ error: "Un mot de passe est requis, d'une longueur de 6 caractères" });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.json({ error: "L'email est déjà associé à un compte" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            prenom, nom, email, password: hashedPassword, wordsRead: 0,
            avatar: 'https://book-brawl.vercel.app/assets/account-D8hsV5Dv.jpeg',
            role: 'user'
        });
        const options = {
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
            maxAge: 2 * 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
        }
        const token = jwt.sign({
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role
        },
            process.env.JWT_SECRET,
            { expiresIn: '2d' })

        return res.status(201).cookie('jwtauth', token, options).json(user);
    } catch (error) {
        console.log(error);
        return res.json({ error: "Un problème est survenu. Réessayer plus tard" });
    }
}

//login
const loginUser = async (req, res) => {
    try {
        const { email, password, stayLoggedIn } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: "L'email n'est associé à aucun compte" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (isPasswordMatch) {
            const cookieDuration = stayLoggedIn ? 7 * 24 * 60 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000;
            const expiration = stayLoggedIn ? '7d' : '2d'
            const options = {
                secure: process.env.NODE_ENV === "production" ? true : false,
                httpOnly: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
                maxAge: cookieDuration,
                expires: new Date(Date.now() + cookieDuration),
                domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
            }
            jwt.sign({
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            },
                process.env.JWT_SECRET,
                { expiresIn: expiration }, (err, token) => {
                    if (err) throw err;
                    res.cookie('jwtauth', token, options).json(user)
                })
        }
        else {
            return res.json({ error: "Mot de passe incorrect" });
        }
    } catch (error) {
        console.log(error);
        return res.json({ error: "Un problème est survenu. Réessayer plus tard" });
    }
}

//logout

const logoutUser = async (req, res) => {
    const options = {
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? 'lax' : '',
        expires: new Date(0),
        domain: process.env.NODE_ENV === "production" ? 'book-brawl.vercel.app' : '',
    }
    res.cookie('jwtauth', 'expiredtoken', options);
    res.status(200).json({ status: "sucess" })
}

//changer de mot de passe 
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.json({ error: "Utilisateur introuvable" });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            console.log('Old password is incorrect');
            return res.json({ error: "L'ancien mot de passe est incorrect" });
        }

        if (newPassword.length < 6) {
            console.log('New password is too short');
            return res.json({ error: "Le nouveau mot de passe doit comporter au moins 6 caractères" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log('Password changed successfully');
        res.json({ success: "Mot de passe changé avec succès" });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: "Une erreur est survenue. Réessayez plus tard." });
    }
};

//changer de mot de passe si oublié
const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            console.log('User not found');
            return res.json({ error: "Utilisateur introuvable" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bookbrawl.contact@gmail.com',
                pass: 'smfm mrrf nubo stsw'
            }
        });

        var resetPasswordLink = process.env.NODE_ENV === "production" ?
            `https://book-brawl.vercel.app/reset-password/${user._id}/${token}` :
            `http://localhost:5173/reset-password/${user._id}/${token}`;

        var mailOptions = {
            from: 'bookbrawl.contact@gmail.com',
            to: email,
            subject: 'Réinitialiser votre mot de passe',
            text: `Vous avez demandé à réinitialiser votre mot de passe. 
            Veuillez suivre ce lien ${resetPasswordLink} pour définir votre noueau mot de passe`,
            html: `
             <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
  <title></title>
  
    <style type="text/css">
      @media only screen and (min-width: 730px) {
  .u-row {
    width: 710px !important;
  }
  .u-row .u-col {
    vertical-align: top;
  }

  .u-row .u-col-33p33 {
    width: 236.643px !important;
  }

  .u-row .u-col-66p67 {
    width: 473.357px !important;
  }

  .u-row .u-col-100 {
    width: 710px !important;
  }

}

@media (max-width: 730px) {
  .u-row-container {
    max-width: 100% !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
  }
  .u-row .u-col {
    min-width: 320px !important;
    max-width: 100% !important;
    display: block !important;
  }
  .u-row {
    width: 100% !important;
  }
  .u-col {
    width: 100% !important;
  }
  .u-col > div {
    margin: 0 auto;
  }
}
body {
  margin: 0;
  padding: 0;
}

table,
tr,
td {
  vertical-align: top;
  border-collapse: collapse;
}

p {
  margin: 0;
}

.ie-container table,
.mso-container table {
  table-layout: fixed;
}

* {
  line-height: inherit;
}

a[x-apple-data-detectors='true'] {
  color: inherit !important;
  text-decoration: none !important;
}

table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: underline; } #u_content_text_1 a { color: #573c95; text-decoration: none; } #u_content_text_2 a { color: #564489; text-decoration: none; } #u_content_text_5 a { color: #564489; text-decoration: none; } #u_content_text_4 a { color: #000000; text-decoration: none; }
    </style>
  
  

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f8cac6;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f8cac6;width:100%" cellpadding="0" cellspacing="0">
  <tbody>
  <tr style="vertical-align: top">
    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f8cac6;"><![endif]-->
    
  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 710px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:710px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="236" style="width: 236px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 236.67px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:times new roman,times;" align="left">
        
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding-right: 0px;padding-left: 0px;" align="center">
      <a href="https://book-brawl.vercel.app" target="_blank">
      <img align="center" border="0" src="https://book-brawl.vercel.app/assets/logo-C7WeNO5g.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 63%;max-width: 136.5px;" width="136.5"/>
      </a>
    </td>
  </tr>
</table>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="473" style="width: 473px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-66p67" style="max-width: 320px;min-width: 473.33px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:57px 10px;font-family:times new roman,times;" align="left">
        
  <!--[if mso]><table width="100%"><tr><td><![endif]-->
    <h1 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-family: verdana,geneva; font-size: 28px; font-weight: 400;"><span><span><span><span><span><span><span><span><span><span><span><span><span><span><span><span><span><span style="text-decoration: underline;">Réinitialisation du mot de passe</span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></h1>
  <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 710px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:710px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="710" style="width: 710px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 710px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:times new roman,times;" align="left">
        
  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 5px dotted #b181e2;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_1" style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:times new roman,times;" align="left">
        
  <div style="font-size: 16px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;">Vous avez récemment demandé à réinitialiser votre mot de passe depuis <a rel="noopener" href="https://book-brawl.vercel.app" target="_blank">https://book-brawl.vercel.app</a></p>
<p style="line-height: 140%;">Veuillez cliquer sur le bouton ci-dessous pour terminer la configuration de votre nouveau mot de passe.</p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 710px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:710px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="710" style="width: 710px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-100" style="max-width: 320px;min-width: 710px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:times new roman,times;" align="left">
        
  <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->
<div align="center">
  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:37px; v-text-anchor:middle; width:213px;" arcsize="11%"  stroke="f" fillcolor="#b181e2"><w:anchorlock/><center style="color:#FFFFFF;"><![endif]-->
    <a href="${resetPasswordLink}" target="_blank" class="v-button" style="box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #b181e2; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;">
      <span style="display:block;padding:10px 20px;line-height:120%;"><span style="line-height: 16.8px;">Réinitialiser mon mot de passe</span></span>
    </a>
    <!--[if mso]></center></v:roundrect><![endif]-->
</div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:times new roman,times;" align="left">
        
  <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 5px dotted #b181e2;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
          <span>&#160;</span>
        </td>
      </tr>
    </tbody>
  </table>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


  
  
<div class="u-row-container" style="padding: 0px;background-color: transparent">
  <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 710px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
    <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:710px;"><tr style="background-color: transparent;"><![endif]-->
      
<!--[if (mso)|(IE)]><td align="center" width="236" style="width: 236px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-33p33" style="max-width: 320px;min-width: 236.67px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_text_2" style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:times new roman,times;" align="left">
        
  <div style="font-family: andale mono,times; font-size: 12px; font-weight: 400; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;"><a rel="noopener" href="https://chat.whatsapp.com/CQNSY4nA3OO3ycC0S2hDuj" target="_blank">Rejoindre la communauté WhatsApp</a></p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
<!--[if (mso)|(IE)]><td align="center" width="473" style="width: 473px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
<div class="u-col u-col-66p67" style="max-width: 320px;min-width: 473.33px;display: table-cell;vertical-align: top;">
  <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
  <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
  
<table id="u_content_text_5" style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:times new roman,times;" align="left">
        
  <div style="font-family: andale mono,times; font-size: 12px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;">Contactez nous : <a rel="noopener" href="mailto:bookbrawl.contact@gmail.com" target="_blank">bookbrawl.contact@gmail.com</a></p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table id="u_content_text_4" style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:times new roman,times;" align="left">
        
  <div style="font-family: andale mono,times; font-size: 11px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <p style="line-height: 140%;"><span style="line-height: 15.4px;"><a rel="noopener" href="https://book-brawl.vercel.app/assets/conditions-BI64dnVI.pdf" target="_blank">TERMS OR SERVICES</a></span></p>
  </div>

      </td>
    </tr>
  </tbody>
</table>

<table style="font-family:times new roman,times;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
  <tbody>
    <tr>
      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:times new roman,times;" align="left">
        
  <div style="font-family: andale mono,times; font-size: 11px; line-height: 140%; text-align: center; word-wrap: break-word;">
    <div>©BOOKBRAWL: ALL RIGHTS RESERVED</div>
<div>
<div>
<div>FEED YOUR NEED TO READ</div>
</div>
</div>
  </div>

      </td>
    </tr>
  </tbody>
</table>

  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
  </div>
</div>
<!--[if (mso)|(IE)]></td><![endif]-->
      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
    </div>
  </div>
  </div>
  


    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
    </td>
  </tr>
  </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
  <!--[if IE]></div><![endif]-->
</body>

</html>
`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(400).json({ error: 'email non envoyé : erreur' })
            } else {
                return res.status(200).json({ message: 'email envoyé' })
            }
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: "Une erreur est survenue. Réessayez plus tard." });
    }
};

const ChangeForgotPassword = async (req, res) => {
    try {
        const { id, token } = req.params;
        const { newPassword } = req.body;

        jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, decoded) => {
            if (err) {
                return res.json({ error: "cookie non reconnu" })
            }
        })

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate({ _id: id }, { password: hashedPassword });

        if (user) {
            res.status(200).json(user)
        }
        else {
            res.json({ error: 'Impossible d\'enregistrer le nouveau mot de passe' })
        }

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: "Une erreur est survenue. Réessayez plus tard." });
    }
};

module.exports = { test, registerUser, loginUser, logoutUser, changePassword, ForgotPassword, ChangeForgotPassword };