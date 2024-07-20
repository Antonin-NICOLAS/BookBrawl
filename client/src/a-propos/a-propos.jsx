import React, { useState, useEffect } from "react";
import Rules from '../assets/rules.pdf'
import Footer from '../components/footer'

import './a-propos.css'

function APropos() {
  return (
    <>
      <embed src={Rules} type="application/pdf" />
      <Footer />
    </>
  )
}

export default APropos;
