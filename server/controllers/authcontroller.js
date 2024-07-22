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
            <!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <!--[if gte mso 15]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Réinitialiser votre mot de passe</title>
  <style>
    img {
      -ms-interpolation-mode: bicubic;
    }

    table,
    td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    .mceStandardButton,
    .mceStandardButton td,
    .mceStandardButton td a {
      mso-hide: all !important;
    }

    p,
    a,
    li,
    td,
    blockquote {
      mso-line-height-rule: exactly;
    }

    p,
    a,
    li,
    td,
    body,
    table,
    blockquote {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }

    @media only screen and (max-width: 480px) {

      body,
      table,
      td,
      p,
      a,
      li,
      blockquote {
        -webkit-text-size-adjust: none !important;
      }
    }

    .mcnPreviewText {
      display: none !important;
    }

    .bodyCell {
      margin: 0 auto;
      padding: 0;
      width: 100%;
    }

    .ExternalClass,
    .ExternalClass p,
    .ExternalClass td,
    .ExternalClass div,
    .ExternalClass span,
    .ExternalClass font {
      line-height: 100%;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    body {
      height: 100%;
      margin: 0;
      padding: 0;
      width: 100%;
      background: #ffffff;
    }

    p {
      margin: 0;
      padding: 0;
    }

    table {
      border-collapse: collapse;
    }

    td,
    p,
    a {
      word-break: break-word;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      display: block;
      margin: 0;
      padding: 0;
    }

    img,
    a img {
      border: 0;
      height: auto;
      outline: none;
      text-decoration: none;
    }

    a[href^="tel"],
    a[href^="sms"] {
      color: inherit;
      cursor: default;
      text-decoration: none;
    }

    li p {
      margin: 0 !important;
    }

    .ProseMirror a {
      pointer-events: none;
    }

    @media only screen and (max-width: 640px) {
      .mceClusterLayout td {
        padding: 4px !important;
      }
    }

    @media only screen and (max-width: 480px) {
      body {
        width: 100% !important;
        min-width: 100% !important;
      }

      body.mobile-native {
        -webkit-user-select: none;
        user-select: none;
        transition: transform 0.2s ease-in;
        transform-origin: top center;
      }

      body.mobile-native.selection-allowed a,
      body.mobile-native.selection-allowed .ProseMirror {
        user-select: auto;
        -webkit-user-select: auto;
      }

      colgroup {
        display: none;
      }

      img {
        height: auto !important;
      }

      .mceWidthContainer {
        max-width: 660px !important;
      }

      .mceColumn {
        display: block !important;
        width: 100% !important;
      }

      .mceColumn-forceSpan {
        display: table-cell !important;
        width: auto !important;
      }

      .mceColumn-forceSpan .mceButton a {
        min-width: 0 !important;
      }

      .mceBlockContainer {
        padding-right: 16px !important;
        padding-left: 16px !important;
      }

      .mceTextBlockContainer {
        padding-right: 16px !important;
        padding-left: 16px !important;
      }

      .mceBlockContainerE2E {
        padding-right: 0px;
        padding-left: 0px;
      }

      .mceSpacing-24 {
        padding-right: 16px !important;
        padding-left: 16px !important;
      }

      .mceImage,
      .mceLogo {
        width: 100% !important;
        height: auto !important;
      }

      .mceFooterSection .mceText,
      .mceFooterSection .mceText p {
        font-size: 16px !important;
        line-height: 140% !important;
      }
    }

    div[contenteditable="true"] {
      outline: 0;
    }

    .ProseMirror h1.empty-node:only-child::before,
    .ProseMirror h2.empty-node:only-child::before,
    .ProseMirror h3.empty-node:only-child::before,
    .ProseMirror h4.empty-node:only-child::before {
      content: 'Heading';
    }

    .ProseMirror p.empty-node:only-child::before,
    .ProseMirror:empty::before {
      content: 'Start typing...';
    }

    .mceImageBorder {
      display: inline-block;
    }

    .mceImageBorder img {
      border: 0 !important;
    }

    body,
    #bodyTable {
      background-color: rgb(244, 244, 244);
    }

    .mceText,
    .mceLabel {
      font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
    }

    .mceText,
    .mceLabel {
      color: rgb(77, 34, 46);
    }

    .mceText h1 {
      margin-bottom: 0px;
    }

    .mceText p {
      margin-bottom: 0px;
    }

    .mceText label {
      margin-bottom: 0px;
    }

    .mceText input {
      margin-bottom: 0px;
    }

    .mceSpacing-12 .mceInput+.mceErrorMessage {
      margin-top: -6px;
    }

    .mceText h1 {
      margin-bottom: 0px;
    }

    .mceText p {
      margin-bottom: 0px;
    }

    .mceText label {
      margin-bottom: 0px;
    }

    .mceText input {
      margin-bottom: 0px;
    }

    .mceSpacing-24 .mceInput+.mceErrorMessage {
      margin-top: -12px;
    }

    .mceInput {
      background-color: transparent;
      border: 2px solid rgb(208, 208, 208);
      width: 60%;
      color: rgb(77, 77, 77);
      display: block;
    }

    .mceInput[type="radio"],
    .mceInput[type="checkbox"] {
      float: left;
      margin-right: 12px;
      display: inline;
      width: auto !important;
    }

    .mceLabel>.mceInput {
      margin-bottom: 0px;
      margin-top: 2px;
    }

    .mceLabel {
      display: block;
    }

    .mceText p {
      color: rgb(77, 34, 46);
      font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
      font-size: 16px;
      font-weight: normal;
      line-height: 150%;
      text-align: center;
      direction: ltr;
    }

    .mceText h1 {
      color: rgb(0, 0, 0);
      font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
      font-size: 31px;
      font-weight: bold;
      line-height: 150%;
      text-align: center;
      direction: ltr;
    }

    .mceText a {
      color: rgb(0, 0, 0);
      font-style: normal;
      font-weight: normal;
      text-decoration: underline;
      direction: ltr;
    }

    @media only screen and (max-width: 480px) {
      .mceText p {
        font-size: 16px !important;
        line-height: 150% !important;
      }
    }

    @media only screen and (max-width: 480px) {
      .mceText h1 {
        font-size: 31px !important;
        line-height: 150% !important;
      }
    }

    @media only screen and (max-width: 480px) {
      .mceBlockContainer {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
    }

    @media only screen and (max-width: 480px) {
      .mceButtonContainer {}

      .mceButtonLink {
        padding: 18px 28px !important;
        font-size: 16px !important;
      }
    }

    @media only screen and (max-width: 480px) {
      .mceDividerContainer {
        width: 100% !important;
      }
    }

    #dataBlockId-5 p,
    #dataBlockId-5 h1,
    #dataBlockId-5 h2,
    #dataBlockId-5 h3,
    #dataBlockId-5 h4,
    #dataBlockId-5 ul {
      text-align: center;
    }
  </style>
</head>

<body>
  <!---->
  <!--[if !gte mso 9]><!----><span class="mcnPreviewText"
    style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">Vous
    avez fait une demande de réinitialisation</span><!--<![endif]-->
  <!---->
  <center>
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable"
      style="background-color: rgb(244, 244, 244);">
      <tbody>
        <tr>
          <td class="bodyCell" align="center" valign="top">
            <table id="root" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tbody data-block-id="9" class="mceWrapper">
                <tr>
                  <td align="center" valign="top" class="mceWrapperOuter">
                    <!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="660" style="width:660px;"><tr><td><![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px"
                      role="presentation">
                      <tbody>
                        <tr>
                          <td
                            style="background-color:#ffffff;background-position:center;background-repeat:no-repeat;background-size:cover"
                            class="mceWrapperInner" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                              role="presentation" data-block-id="8">
                              <tbody>
                                <tr class="mceRow">
                                  <td
                                    style="background-position:center;background-repeat:no-repeat;background-size:cover"
                                    valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top:0;padding-bottom:0" class="mceColumn"
                                            data-block-id="-4" valign="top" colspan="12" width="100%">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                              role="presentation">
                                              <tbody>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    class="mceBlockContainer" align="center" valign="top"><a
                                                      href="https://book-brawl.vercel.app/" style="display:block"
                                                      target="_blank" data-block-id="11"><span class="mceImageBorder"
                                                        style="border:0;border-radius:0;vertical-align:top;margin:0"><img
                                                          width="660" height="auto"
                                                          style="width:660px;height:auto;max-width:660px !important;border-radius:0;display:block"
                                                          alt=""
                                                          src="https://mcusercontent.com/d82671e0cb0299b9581802a77/images/7bf347ae-213d-34b6-b490-d77c30936ec6.jpeg"
                                                          role="presentation" class="imageDropZone mceImage"></span></a>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    valign="top">
                                                    <table width="100%" style="border:0;border-collapse:separate">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="padding-left:24px;padding-right:24px;padding-top:12px;padding-bottom:12px"
                                                            class="mceTextBlockContainer">
                                                            <div data-block-id="13" class="mceText" id="dataBlockId-13"
                                                              style="width:100%">
                                                              <h1 class="last-child"><span
                                                                  style="color:#79313c;">Réinitialisation du mot de
                                                                  passe</span></h1>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    valign="top">
                                                    <table width="100%" style="border:0;border-collapse:separate">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="padding-left:18px;padding-right:18px;padding-top:12px;padding-bottom:12px"
                                                            class="mceTextBlockContainer">
                                                            <div data-block-id="3" class="mceText" id="dataBlockId-3"
                                                              style="width:100%">
                                                              <p style="text-align: left;"><span
                                                                  style="color:#4d222e;">Hello &lt;&lt; Test First Name
                                                                  &gt;&gt; !</span></p>
                                                              <p style="text-align: justify;"><span
                                                                  style="color:#4d222e;">Tu as fait une demande de
                                                                  réinitialisation de mot de passe depuis </span><a
                                                                  href="https://book-brawl.vercel.app/" target="_blank"
                                                                  style="color: #4d222e;">BookBrawl - Website</a><span
                                                                  style="color:#4d222e;">.</span></p>
                                                              <p style="text-align: center;" class="last-child"><span
                                                                  style="color:#4d222e;">Clique sur le bouton ci-dessous
                                                                  pour terminer la configuration du nouveau mot de
                                                                  passe</span> 👇</p>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:4px;padding-bottom:12px;padding-right:24px;padding-left:24px"
                                                    class="mceBlockContainer" align="center" valign="top">
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                      role="presentation" data-block-id="12" class="mceButtonContainer">
                                                      <tbody>
                                                        <tr><!--[if !mso]><!--></tr>
                                                        <tr class="mceStandardButton">
                                                          <td
                                                            style="background-color:#ffe5d9;border-radius:0;text-align:center"
                                                            class="mceButton" valign="top"><a href="" target="_blank"
                                                              class="mceButtonLink"
                                                              style="background-color:#ffe5d9;border-radius:0;border:1px solid #ffdbd8;color:#79313c;display:block;font-family:'Helvetica Neue', Helvetica, Arial, Verdana, sans-serif;font-size:16px;font-weight:bold;font-style:normal;padding:16px 28px;text-decoration:none;min-width:30px;text-align:center;direction:ltr;letter-spacing:0px">Modifier
                                                              mon mot de passe</a></td>
                                                        </tr>
                                                        <tr><!--<![endif]--></tr>
                                                        <tr>
                                                          <!--[if mso]>
<td align="center">
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:w="urn:schemas-microsoft-com:office:word"
href=""
style="v-text-anchor:middle; width:264.75px; height:52px;"
arcsize="0%"
strokecolor="#ffdbd8"
strokeweight="1px"
fillcolor="#ffe5d9">
<v:stroke dashstyle="solid"/>
<w:anchorlock />
<center style="
color: #79313c;
display: block;
font-family: 'Helvetica Neue', Helvetica, Arial, Verdana, sans-serif;
font-size: 16;
font-style: normal;
font-weight: bold;
letter-spacing: 0px;
text-decoration: none;
text-align: center;
direction: ltr;"
>
Modifier mon mot de passe
</center>
</v:roundrect>
</td>
<![endif]-->
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    valign="top">
                                                    <table width="100%" style="border:0;border-collapse:separate">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="padding-left:24px;padding-right:24px;padding-top:12px;padding-bottom:12px"
                                                            class="mceTextBlockContainer">
                                                            <div data-block-id="14" class="mceText" id="dataBlockId-14"
                                                              style="width:100%">
                                                              <p class="last-child"><span style="color:#9d8189;">Tu n’as
                                                                  pas fait de demande ? Ignore simplement cet email
                                                                  !</span></p>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="background-color:transparent;padding-top:20px;padding-bottom:20px;padding-right:12px;padding-left:12px"
                                                    class="mceBlockContainer" valign="top">
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                      width="100%" style="background-color:transparent;width:100%"
                                                      role="presentation" class="mceDividerContainer"
                                                      data-block-id="16">
                                                      <tbody>
                                                        <tr>
                                                          <td style="min-width:100%;border-top:1px dashed #9d8189"
                                                            class="mceDividerBlock" valign="top"></td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    valign="top">
                                                    <table width="100%" style="border:0;border-collapse:separate">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="padding-left:24px;padding-right:24px;padding-top:0;padding-bottom:0"
                                                            class="mceTextBlockContainer">
                                                            <div data-block-id="15" class="mceText" id="dataBlockId-15"
                                                              style="width:100%">
                                                              <p class="last-child"><strong><span
                                                                    style="color:#79313c;"><span
                                                                      style="font-size: 24px">Bonne lecture
                                                                      !</span></span></strong><br><span
                                                                  style="color:#4d222e;">L’équipe Bookbrawl</span></p>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="background-color:transparent;padding-top:20px;padding-bottom:20px;padding-right:16px;padding-left:16px"
                                                    class="mceBlockContainer" valign="top">
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                      width="100%" style="background-color:transparent;width:100%"
                                                      role="presentation" class="mceDividerContainer"
                                                      data-block-id="30">
                                                      <tbody>
                                                        <tr>
                                                          <td style="min-width:100%;border-top:1px solid #9d8189"
                                                            class="mceDividerBlock" valign="top"></td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    valign="top">
                                                    <table width="100%" style="border:0;border-collapse:separate">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="padding-left:24px;padding-right:24px;padding-top:12px;padding-bottom:3px"
                                                            class="mceTextBlockContainer">
                                                            <div data-block-id="18" class="mceText" id="dataBlockId-18"
                                                              style="width:100%">
                                                              <p style="text-align: center; direction: ltr;"
                                                                class="last-child"><span style="color:#9d8189;"><span
                                                                    style="font-size: 14px">Une question ? Contacte nous
                                                                    à</span></span><strong><span
                                                                    style="color:#9d8189;"><span
                                                                      style="font-size: 14px">
                                                                      bookbrawl.contact@gmail.com</span></span></strong><span
                                                                  style="color:rgb(157, 129, 137);"><span
                                                                    style="font-size: 14px"> OU
                                                                  </span></span><strong><span
                                                                    style="color:rgb(157, 129, 137);"><span
                                                                      style="font-size: 14px">répond
                                                                    </span></span></strong><span
                                                                  style="color:rgb(157, 129, 137);"><span
                                                                    style="font-size: 14px">à cet email</span></span>
                                                              </p>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                    valign="top">
                                                    <table width="100%" style="border:0;border-collapse:separate">
                                                      <tbody>
                                                        <tr>
                                                          <td
                                                            style="padding-left:24px;padding-right:24px;padding-top:0;padding-bottom:12px"
                                                            class="mceTextBlockContainer">
                                                            <div data-block-id="25" class="mceText" id="dataBlockId-25"
                                                              style="width:100%">
                                                              <p style="text-align: center;" class="last-child"><span
                                                                  style="color:#9d8189;"><span
                                                                    style="font-size: 14px">Rejoint la communauté
                                                                    WhatsApp : </span></span><a
                                                                  href="https://chat.whatsapp.com/CQNSY4nA3OO3ycC0S2hDuj"
                                                                  target="_blank" style="color: #9d8189;"><strong><span
                                                                      style="font-size: 14px">IMAGE</span></strong></a>
                                                              </p>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td
                                                    style="background-color:#f4f4f4;padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px"
                                                    class="mceLayoutContainer" valign="top">
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                                      width="100%" role="presentation" data-block-id="7"
                                                      id="section_e07f8515b63dc8d27955c950784070bc"
                                                      class="mceFooterSection">
                                                      <tbody>
                                                        <tr class="mceRow">
                                                          <td
                                                            style="background-color:#f4f4f4;background-position:center;background-repeat:no-repeat;background-size:cover;padding-top:0px;padding-bottom:0px"
                                                            valign="top">
                                                            <table border="0" cellpadding="0" cellspacing="12"
                                                              width="100%" role="presentation">
                                                              <tbody>
                                                                <tr>
                                                                  <td
                                                                    style="padding-top:0;padding-bottom:0;margin-bottom:12px"
                                                                    class="mceColumn" data-block-id="-3" valign="top"
                                                                    colspan="12" width="100%">
                                                                    <table border="0" cellpadding="0" cellspacing="0"
                                                                      width="100%" role="presentation">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td
                                                                            style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0"
                                                                            align="center" valign="top">
                                                                            <table width="100%"
                                                                              style="border:0;border-collapse:separate">
                                                                              <tbody>
                                                                                <tr>
                                                                                  <td
                                                                                    style="padding-left:16px;padding-right:16px;padding-top:12px;padding-bottom:12px"
                                                                                    class="mceTextBlockContainer">
                                                                                    <div data-block-id="5"
                                                                                      class="mceText" id="dataBlockId-5"
                                                                                      style="display:inline-block;width:100%">
                                                                                      <p class="last-child"><a
                                                                                          href="https://mailchi.mp/38e0a080bca3/rinitialiser-votre-mot-de-passe?e=[UNIQID]"><span
                                                                                            style="font-size: 11px">View
                                                                                            email in
                                                                                            browser</span></a><span
                                                                                          style="font-size: 11px"><br>Copyright
                                                                                          (C) 2024 BookBrawlTM. All
                                                                                          rights reserved.<br></span><a
                                                                                          href="https://app.us17.list-manage.com/profile?u=d82671e0cb0299b9581802a77&id=a6398fea74&e=[UNIQID]&c=045b5e8156"><span
                                                                                            style="font-size: 11px">update
                                                                                            your
                                                                                            preferences</span></a><span
                                                                                          style="font-size: 11px"> or
                                                                                        </span><a
                                                                                          href="https://app.us17.list-manage.com/unsubscribe?u=d82671e0cb0299b9581802a77&id=a6398fea74&t=b&e=[UNIQID]&c=045b5e8156"><span
                                                                                            style="font-size: 11px">unsubscribe</span></a>
                                                                                      </p>
                                                                                    </div>
                                                                                  </td>
                                                                                </tr>
                                                                              </tbody>
                                                                            </table>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table><!--[if (gte mso 9)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </center>
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