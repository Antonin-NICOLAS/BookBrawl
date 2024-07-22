import React, { useState, useEffect } from "react";
import Rules from '../assets/rules.pdf'

import './a-propos.css'

function APropos() {
  return (
    <>
      <embed src={Rules} type="application/pdf" />
    </>
  )
}

export default APropos;
