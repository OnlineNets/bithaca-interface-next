// Layout
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";

// Components
import Meta from "@/UI/components/Meta/Meta";

const TermAndCondition = () => {
  return (
    <>
      <Meta />
      <Main>
        <Container>
          <h1 className='mb-20 mt-10' style={{ fontSize: "24px" }}>
            Terms and Conditions
          </h1>
          <h5 className='mb-20'>Updated as of 14.03.2024</h5>
          <h1>Preamble</h1>
          <h4 style={{ fontWeight: "normal", marginBottom: -10 }}>
            <p>
              These terms and conditions (the &quot;<b>Terms & Conditions</b>&quot; or &quot;<b>T&Cs</b>&quot;) govern
              the access and utilisation of <a href='https://www.ithacaprotocol.io'>https://www.ithacaprotocol.io</a>{" "}
              and <a href='https://app.ithacaprotocol.io'>https://app.ithacaprotocol.io</a> (the &quot;<b>Website</b>
              &quot;) by each individual, entity, group, or association (collectively &quot;
              <b>User</b>&quot;, &quot;<b>Users</b>&quot;, &quot;<b>You</b>&quot;) who views, interacts or otherwise
              uses or derives any beneﬁt from the Interface (as deﬁned below) or the Infrastructure (as deﬁned below).{" "}
            </p>
            <br />
            <p>
              Without prejudice to the preceding paragraph, the User’s consent is manifested once the User ticks the box
              in the pop-up window which appears upon connecting its Wallet (as deﬁned below), which reads: “By ticking
              this box, I conﬁrm I have read, understood and accepted the Terms & Conditions of Ithaca Protocol”.{" "}
            </p>
            <br />
            <p>
              Any modiﬁcation to the Terms & Conditions shall be effective immediately after uploading the updated
              version on the Interface. The User’s continued use of the Interface shall constitute its acceptance of the
              current version of the Terms & Conditions. The User is advised to review the Terms & Conditions
              periodically to be aware of any changes to the Terms & Conditions.
            </p>
            <br />
          </h4>
          <br />
          <br />
          <h1>TERMS & CONDITIONS</h1>
          <ol type='1'>
            <li>
              <h3>The Interface and Infrastructure</h3>
              <ol type='1'>
                <li>
                  The Website provides access to an interface (the &quot;<b>Interface</b>&quot;) that facilitates the
                  Users&apos; interaction and utilisation with a set of on-chain smart contracts (the &quot;
                  <b>Infrastructure</b>&quot;).
                </li>
                <li>
                  Users employ the Infrastructure, retaining complete ownership and custody of their cryptographic
                  assets and the private keys associated with their blockchain-based digital wallets. Users bear sole
                  responsibility for securely overseeing their private keys and verifying all transactions. Given that
                  the Infrastructure provided via the Interface operates on decentralised external networks, there
                  exists no capability to annul, reverse, or reinstate any transactions.
                </li>
                <li>
                  The Infrastructure makes interaction methods available whereby the User can independently perform
                  on-chain transactions. Such interaction methods may include accessing functionalities for Users to
                  self-authorise crypto-asset transfers and self-mint crypto-assets on relevant blockchains. When used
                  in this way, the Infrastructure can generate a draft transaction message, which a User can
                  independently use in conjunction with a third-party digital wallet application or device to conduct
                  transactions on any of the relevant blockchains.
                </li>
                <li>
                  This Interface and the Infrastructure are provided “as is” and “as available” without a warranty of
                  any kind. By using the Interface and the Infrastructure, the User accepts sole responsibility for any
                  transaction involving their Wallet (as deﬁned below).
                </li>
                <li>
                  No advice whatsoever concerning crypto-assets or the use of the Infrastructure is provided on or
                  through the Interface.
                </li>
              </ol>
            </li>
            <br />
            <br />
            <li>
              <h3>Orders</h3>
              <ol type='1'>
                <li>
                  Users independently and autonomously submit their trading orders (each one an &quot;<b>Order</b>
                  &quot;, collectively the &quot;<b>Orders</b>&quot;) on the Infrastructure through the Interface. Upon
                  submission of an Order, the User locks a predetermined amount of crypto-assets (the &quot;
                  <b>Collateral</b>&quot;) in a designated smart contract (the &quot;<b>Collateral Smart Contract</b>
                  &quot;). The Collateral corresponds to the maximum potential loss for each Order.
                </li>
                <li>
                  The Collateral Smart Contract is programmed to communicate with tools responsible for the off-chain
                  calculation of order matches based on the parameters set forth by the Users (the &quot;<b>Oracles</b>
                  &quot;).
                </li>
                <li>
                  The Oracles may determine the Collateral excess in connection with an Order and issue automated
                  instructions for the Collateral Smart Contract to return a certain amount of crypto-assets to the
                  User’s Wallet. The User acknowledges and agrees that collateral optimisation is an integral aspect of
                  risk management within the Interface. By engaging with the Interface, the User implicitly accepts and
                  adheres to the principles of collateral optimisation as outlined in this section and explained within
                  the materials made available on or through the Interface.
                </li>
                <li>
                  Once a match is identiﬁed by the Oracles, they transmit instructions to the Collateral Smart Contract
                  to execute the matched trades. These instructions include but are not limited to, the transfer of
                  crypto-assets within the Collateral Smart Contract amongst the participating Users&apos; Wallets in
                  accordance with the agreed parameters of the trade.
                </li>
                <li>
                  The Oracles include an auction-based matching engine (the &quot;<b>IME</b>&quot;). The IME operates
                  through frequent auctions, employing batch processing (the &quot;<b>Auction(s)</b>&quot;). The Auction
                  mechanism is discrete-time and employs a uniform-price model. The IME accepts Orders submitted by
                  counterparties. The IME runs across multiple order books with different products and maturities,
                  enabling synchronised execution of multi-leg conditional orders.
                </li>
              </ol>
            </li>
            <li>
              <h3>User Obligations, Representations and Warranties</h3>
              <ol type='1'>
                <li>
                  The User is expected to use the Interface and the Infrastructure legally and responsibly. Any misuse
                  or activities contrary to the Terms & Conditions or applicable laws are strictly prohibited.
                </li>
                <li>
                  The User can only use the Interface and the Infrastructure as expressly allowed under these T&Cs and
                  cannot modify, sell, or exploit the underlying software in any unauthorised manner.
                </li>
                <li>
                  The Interface and the Infrastructure shall be used solely within the scope of commercial activities by
                  individual professionals and business organisations that have the intentions, skills, abilities and
                  resources to engage in complex and highly risky transactions.
                </li>
                <li>
                  By accessing the Interface, the User represents and warrants that:
                  <ol type='1'>
                    <li>as an individual, he/she is at least eighteen (18) years old;</li>
                    <li>is acting for commercial purposes and not in his/her capacity as a consumer;</li>
                    <li>
                      posses a compatible blockchain-based digital wallet (hereinafter referred to as the &quot;
                      <b>Wallet</b>&quot;);
                    </li>
                    <li>
                      as an individual, business company, or other legal person, it has power and sufﬁcient
                      authorisations to enter into the T&Cs;
                    </li>
                    <li>
                      its use of the Interface will not violate laws and regulations applicable to the User, including
                      but not limited to regulation on anti-money laundering, anti-corruption, and counter-terrorist
                      ﬁnancing;
                    </li>
                    <li>
                      is not a &quot;<b>U.S. Person</b>&quot;, whereas a &quot;U.S. Person&quot; shall mean any
                      individual who is a citizen or resident of the United States, any partnership or corporation
                      organised or incorporated under the laws of the United States, any estate of which any executor or
                      administrator is a U.S. Person, any trust of which a trustee is a U.S. Person, any agency or
                      branch of a foreign entity located in the United States, any non-discretionary account or similar
                      account (other than an estate or trust) held by a dealer or other ﬁduciary for the beneﬁt or
                      account of a U.S. Person, and any discretionary account or similar account (other than an estate
                      or trust) held by a dealer or other ﬁduciary organised, incorporated, or (if an individual)
                      resident in the United States;
                    </li>
                    <li>
                      is not a resident, citizen, national or agent of, or an entity organised, incorporated or doing
                      business in, Belarus, Burundi, Crimea and Sevastopol, Cuba, Democratic Republic of Congo, Iran,
                      Iraq, Libya, North Korea, Somalia, Sudan, Syria, Venezuela, Zimbabwe, Algeria, Bolivia, Morocco,
                      Nepal, Pakistan, Vietnam, Afghanistan, Ivory Coast, South Sudan, Antigua, Northern Mariana
                      Islands, Puerto Rico, United States Minor Outlying Islands, US Virgin Islands, Ukraine, Belarus,
                      Albania, Burma, Central African Republic, Yemen, Thailand or any other country to which the United
                      States of America, the United Kingdom of Great Britain and Northern Ireland, the European Union,
                      or the United Nations, (collectively, the &quot;<b>Major Jurisdictions</b>&quot;) embargoes goods
                      or services or imposes other economic sanctions (such embargoed or sanctioned territories,
                      collectively, the &quot;<b>Restricted Territories</b>&quot;);
                    </li>
                    <li>
                      is not, and do not directly or indirectly own or control, and has not received any assets from any
                      digital wallet that is listed on any sanctions list or equivalent maintained by any competent
                      authority of the Major Jurisdictions (such sanctions-listed persons, collectively, the &quot;
                      <b>Sanctions Lists Persons</b>&quot;); and
                    </li>
                    <li>
                      does not intend to transact in or with any Restricted Territories or Sanctions List Persons;
                    </li>
                  </ol>
                </li>
                <li>
                  Users undertake to use the Interface and Infrastructure in accordance with the Terms & Conditions and
                  all applicable laws. Within their use of Interface, each User agrees not to:
                  <ol type='1'>
                    <li>
                      Use the Interface or the Infrastructure for, or to promote or facilitate, illegal activity
                      (including, without limitation, money laundering, ﬁnancing terrorism, tax evasion, buying or
                      selling illegal drugs, contraband, counterfeit goods, or illegal weapons);
                    </li>
                    <li>
                      Upload or transmit viruses, worms, Trojan horses, time bombs, cancelbots, spiders, malware, or any
                      other type of malicious code that will or may be used in any way that will affect the
                      functionality or operation of the Interface;
                    </li>
                    <li>
                      Harvest or otherwise collect information from the Interface or the Infrastructure for any
                      unauthorised purpose;
                    </li>
                    <li>Exploit the Infrastructure for any unauthorised commercial purpose;</li>
                    <li>
                      Attempt to or actually copy or make unauthorised use of all or any portion of the Infrastructure,
                      including by attempting to reverse, compile, reformatting or framing, disassemble, reverse
                      engineer any part of the Infrastructure;
                    </li>
                    <li>Engage in any anti-competitive behaviour or other misconduct;</li>
                    <li>Breach or encourage others to breach the Terms & Conditions.</li>
                  </ol>
                </li>
                <li>
                  The User commits to taking essential precautions to secure their Wallet and personal details. The
                  Users hold exclusive responsibility for safeguarding their Wallet and are solely responsible for all
                  associated transactions.
                </li>
                <li>
                  Users are solely responsible for their tax obligations and reporting duties in connection with their
                  access and use of the Interface and the Infrastructure.
                </li>
                <li>
                  Any Wallet may be banned from accessing the Interface in connection with the violation of the above.
                </li>
              </ol>
            </li>
            <li>
              <h3>Fees</h3>
              <ol type='1'>
                <li>
                  The Interface will automatically retain fees from each Order. The User hereby consents to this
                  automated fee retention mechanism.
                </li>
                <li>
                  The User acknowledges that a comprehensive fees table is consistently accessible on the Interface,
                  providing a clear breakdown of applicable charges associated with their transactions (the &quot;
                  <b>Fee Table</b>&quot;). The Fee Table may be amended from time to time. Such modiﬁcations will be
                  effective immediately upon being updated on the Interface without any prior notice to the User. It is
                  the sole responsibility of the User to check the Interface regularly for any updates in the Fee Table.
                  By continuing to utilise the Interface after any modiﬁcations to the Fee Table, the User accepts and
                  agrees to the updated Fee Table.
                </li>
              </ol>
            </li>
            <li>
              <h3>Rewards</h3>
              <ol type='1'>
                <li>
                  The Interface includes several reward mechanisms made available to the Users to incentivise and
                  promote positive behaviours that shall beneﬁt all Users (the &quot;<b>Point System</b>&quot;). The
                  Point System encompasses various types of rewards, each designed to recognise and incentivise
                  different actions and contributions. Speciﬁc details regarding the Point System are outlined in the
                  Interface&apos;s dedicated Point Systemsection.
                </li>
                <li>
                  The User bears the responsibility of thoroughly reading and comprehending the details presented in the
                  Interface&apos;s dedicated Point System section.
                </li>
                <li>
                  The User is advised that the Point System and associated details, including the types of rewards and
                  the actions required to obtain them, may undergo changes without prior notice. It is incumbent upon
                  the User to regularly check the Interface for any updates or modiﬁcations to the Point System.
                </li>
              </ol>
            </li>
            <li>
              <h3>Third Parties Services</h3>
              <ol type='1'>
                <li>
                  The Interface may integrate third-party services or applications (the &quot;
                  <b>Third-Party Services</b>&quot;) to enhance the User experience and functionality.
                </li>
                <li>
                  The User is advised to exercise diligence in assessing the security and privacy implications
                  associated with Third-Party Services. The User understands that these services are independent
                  entities, and any issues, disputes, or concerns arising from the use of Third-Party Services should be
                  directed to the respective third parties.
                </li>
                <li>
                  The Interface might modify or discontinue the integration of any Third-Party Services. The User will
                  be notiﬁed of such changes through appropriate channels, and it is their responsibility to stay
                  informed about any adjustments to the availability of third-party offerings.
                </li>
                <li>
                  Some Third-Party Services may necessitate the sharing of User data. The User explicitly consents to
                  the sharing of relevant data with third parties, understanding that the privacy policies of the
                  respective third parties govern such data sharing.
                </li>
                <li>
                  By opting to utilise Third-Party Services within the Interface, the User expressly accepts and agrees
                  to comply with the terms and conditions set forth by the relevant third parties. Any violations may
                  result in corrective actions, including the restriction or termination of access to the Interface.
                </li>
              </ol>
            </li>
            <li>
              <h3>Risk Disclosure</h3>
              <ol type='1'>
                <li>
                  The User acknowledges and assumes all risks associated with the use of the Interface and the
                  Infrastructure and any related crypto-assets transactions. These risks include but are not limited to:
                  <ol type='1'>
                    <li>
                      <u>Operational Risk</u>: The Interface may be subject to changes, discontinuations, or
                      interruptions. The User understands that there is no guarantee of the perpetual operation or
                      support of the Interface, and its maintainers may cease operations or support without any
                      obligation or notice to the User.
                    </li>
                    <li>
                      <u>Regulatory Risk</u>: The Interface operates in a legal and regulatory environment that may
                      change. The User is aware that changes in regulations or laws may adversely affect the use of the
                      Interface and the underlying blockchain technologies.
                    </li>
                    <li>
                      <u>Lack of Regulatory Oversight</u>: The User acknowledges that neither the Interface nor its
                      maintainers are under the supervision of any regulatory authority. The Interface is not endorsed
                      or regulated by government or ﬁnancial agencies, and no warranties are made regarding legal
                      compliance or regulatory alignment.
                    </li>
                    <li>
                      <u>Technology Risk</u>: The Interface and Infrastructure are based on blockchain technology, which
                      is a new and rapidly evolving ﬁeld. The User understands that there is an inherent risk of bugs,
                      errors, vulnerabilities, or defects in any software or blockchain, which could affect transactions
                      and lead to ﬁnancial losses.
                    </li>
                    <li>
                      <u>Information and Accuracy Risk</u>: The User understands that the Interface does not guarantee
                      the accuracy or timeliness of the information provided. The User is responsible for conducting
                      their own due diligence regarding transactions.
                    </li>
                    <li>
                      <u>Crypto-asset Risk</u>: The User accepts the risks associated with the devaluation of
                      crypto-assets up to the entire loss of their value. Certain market conditions might make it hard
                      to liquidate the User&apos;s crypto-assets or perform any transactions, especially when
                      there&apos;s limited market movement or low liquidity.
                    </li>
                    <li>
                      <u>Security Risk</u>: The User bears sole responsibility for the security of their private keys
                      and any credentials related to their Wallets. The User acknowledges that the Interface is not
                      responsible for safeguarding the User&apos;s digital assets or personal information.
                    </li>
                    <li>
                      <u>Transaction Risk</u>: The User acknowledges that transactions, once executed, are irreversible,
                      and any transaction fees incurred are non-refundable. The User is aware that the Interface does
                      not have the ability to reverse transactions.
                    </li>
                    <li>
                      <u>Access Restrictions</u>: We reserve the right to restrict access to the Interface for any
                      reason, including but not limited to suspicion of illegal activity, fraud, or violation of these
                      T&Cs. This may include restrictions based on sanctions law or your location in certain
                      territories.
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
            <li>
              <h3>Survival</h3>
              <ol type='1'>
                <li>
                  If any provision of the Terms & Conditions is found to be invalid by a court of law or other judicial
                  body, that provision shall be limited in accordance with applicable law; the remaining provisions will
                  remain in full force and effect.
                </li>
                <li>
                  Provisions within these Terms & Conditions that inherently persist beyond their conclusion or
                  termination, especially those sections addressing suspension, termination, the Interface restrictions,
                  outstanding debts to the Interface, general website usage, disagreements with the Interface, and other
                  foundational clauses, will remain in effect even after these Terms & Conditions have ended or been
                  terminated.
                </li>
              </ol>
            </li>
            <li>
              <h3>Availability & Network Costs</h3>
              <ol type='1'>
                <li>
                  The Interface may occasionally experience downtime due to maintenance or updates. No guarantee
                  whatsoever is given for the uninterrupted operation of the Interface. The Interface may be
                  discontinued.
                </li>
                <li>
                  The User may incur direct and indirect fees and costs associated with their use of the Interface and
                  Infrastructure.
                </li>
              </ol>
            </li>
            <li>
              <h3>Intellectual Property</h3>
              <ol type='1'>
                <li>
                  All text, graphics, User interfaces, visual interfaces, photographs, logos, artwork and computer code
                  provided on the Website, including but not limited to the design, structure, selection, coordination,
                  expression and arrangement of the content contained on the Website is an intellectual property of the
                  Company that had licensed their usage to the Company, and is protected by trademark laws, and various
                  other intellectual property rights.
                </li>
                <li>
                  Except as expressly provided in these Terms & Conditions, no part of the Website and no content
                  indicated therein may be copied, reproduced, republished, uploaded, posted, publicly displayed,
                  encoded, translated, transmitted or distributed in any way to any other computer, server, Website or
                  other medium for publication or distribution for any commercial purpose, without the Company’s express
                  prior written consent.
                </li>
              </ol>
            </li>
            <li>
              <h3>Limitation of Liability</h3>
              <ol type='1'>
                <li>
                  The User acknowledges that the Interface, including the Infrastructure and any associated tools or
                  content, is provided on an &quot;<i>as is</i>&quot; and &quot;<i>as available</i>&quot; basis.
                  Therefore, to the maximum extent permitted by applicable law, the User agrees that no legal entity or
                  member of the team that developed the Interface and the Infrastructure, nor any of its afﬁliates,
                  directors, employees, or other representatives, shall bear any liability for any direct, incidental,
                  indirect, special, punitive, consequential, or exemplary damages (including damages for loss of
                  business, loss of proﬁts, business interruption, or loss of business information) arising out of or in
                  connection with the use of or inability to use the Interface and the Infrastructure or the performance
                  of any transactions through the Interface and the Infrastructure, even if such party has been advised
                  of the possibility of such damages.
                </li>
                <li>
                  The User further agrees that the total liability of the developers, afﬁliates, directors, employees,
                  or other representatives in connection with any claim arising out of or relating to the Interface
                  and/or the User’s use thereof shall not exceed the total amount of fees actually paid by the User for
                  the use of the Interface that is the subject of the claim, up to a maximum of 20’000 USD.
                </li>
                <li>
                  This limitation of liability reﬂects the allocation of risk between the parties. The limitations
                  speciﬁed in this section will survive and apply even if any limited remedy speciﬁed in these T&Cs is
                  found to have failed its essential purpose. The limitations of liability provided in these T&Cs inure
                  to the beneﬁt of the developers, afﬁliates, directors, employees, and agents of the Interface.
                </li>
                <li>
                  Nothing in this clause shall exclude or limit liability to a greater extent than is permitted by
                  applicable law, nor shall it exclude or limit any statutory rights that a User cannot lawfully agree
                  to exclude or limit.
                </li>
              </ol>
            </li>
            <li>
              <h3>Indemnity</h3>
              <ol type='1'>
                <li>
                  You agree to defend, indemnify, and hold harmless the Company, including its Affiliates, contractors,
                  directors and all of their respective officers, agents, sub-contractors, partners, and employees, from
                  and against any losses, damage, liability, claim, or demand, including reasonable attorneys&apos; fees
                  and expenses, made by third party due to or arising out of Your:
                  <br />
                  <br />
                  i. use of or inability to use any of the Services
                  <br />
                  ii. violation of these Terms,
                  <br />
                  iii. violation of any rights of a third party, or
                  <br />
                  iv. violation of any applicable Laws or Government orders.
                  <br />
                  <br />
                  Notwithstanding anything otherwise provided, We reserve the right, at Your expense, to assume the
                  exclusive defence and control of any matter for which You are required to indemnify the Company, in
                  which event You will fully cooperate with the Company in asserting any available defences in the
                  Company&apos;s discretion.
                </li>
              </ol>
            </li>
            <li>
              <h3>License to use the Interface and the Infrastructure</h3>
              <ol type='1'>
                <li>
                  Contingent upon your ongoing compliance with these T&Cs, the User is granted a personal, worldwide,
                  revocable, non-exclusive, and non-assignable license to use the Interface and the Infrastructure. The
                  only purpose of this license is to allow the User to use and enjoy the Interface and the
                  Infrastructure solely as permitted by these T&Cs.
                </li>
              </ol>
            </li>
            <li>
              <h3>Governing Law and Dispute Resolution</h3>
              <ol type='1'>
                <li>
                  These Terms & Conditions, and all claims or causes of action (whether in contract, tort or statute)
                  that may be based upon, arise out of or relate to these T&Cs or the negotiation, execution or
                  performance of these T&Cs (including any claim or cause of action based upon, arising out of or
                  related to any representation or warranty made in or in connection with these T&Cs or as an inducement
                  to enter into these T&Cs), shall be governed by, and enforced in accordance with, the internal laws of
                  the Federation of Saint Christopher and Nevis, including its statutes of limitations.
                </li>
                <li>
                  Any dispute, controversy, or claim arising out of, or in relation to, these Terms & Conditions,
                  including regarding the validity, invalidity, breach, or termination thereof, shall be resolved by
                  arbitration in accordance with the Swiss Rules of International Arbitration of the Swiss Arbitration
                  Centre in force on the date on which the Notice of Arbitration is submitted in accordance with those
                  Rules. The number of arbitrators shall be one. The seat, or legal place, of arbitration shall be
                  Geneve (CH). The language to be used in the arbitral proceedings shall be English.
                </li>
                <li>
                  The Parties agree that any dispute is personal to the User and the Interface and that any dispute
                  shall only be resolved by individual litigation and shall not be brought as a class action or any
                  other representative proceeding. The User agrees that a dispute cannot be brought as a class or
                  representative action or on behalf of any other person.
                </li>
                <li>
                  In case of dispute, the User shall maintain the conﬁdentiality of any proceedings, including but not
                  limited to any information gathered, prepared, and presented for purposes of the litigation or related
                  to the dispute(s) therein.
                </li>
              </ol>
            </li>
            <li>
              <h3>Privacy Policy</h3>
              All information collected on the Website is subject to the Privacy Policy. By using the Service, You
              consent to all actions taken with respect to Your information in compliance with the Privacy Policy.
            </li>
            <li>
              <h3>Contact</h3>
              In order to address a question, to resolve a complaint regarding the Website or the Company’s services, or
              to receive further information regarding the services, please contact the Company via e-mail at
              admin@sophosinc.com
            </li>
          </ol>
        </Container>
      </Main>
    </>
  );
};

export default TermAndCondition;
