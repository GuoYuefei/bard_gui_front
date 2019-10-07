import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import BardConfigForm from "../components/bard_config_form"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <BardConfigForm /> 
  </Layout>
)

export default IndexPage
