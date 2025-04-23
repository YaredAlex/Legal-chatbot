const serviceContractTemplate = `
SERVICE AGREEMENT

This Service Agreement (“Agreement”) is made and entered into on {{date}} by and between:

Client: {{client_name}}, located at {{client_address}}

and

Service Provider: {{provider_name}}, located at {{provider_address}}

1. Scope of Services
   The Service Provider agrees to provide the following services:  
   {{service_description}}

2. Term
   The agreement will commence on {{start_date}} and remain effective until {{end_date}}, unless terminated earlier in accordance with this Agreement.

3. Payment
   The Client agrees to pay {{payment_amount}} for the services provided, payable {{payment_schedule}}.

4. Responsibilities

- The Service Provider shall perform the services in a professional manner.
- The Client shall provide necessary access and support.

5. Termination
   Either party may terminate this Agreement with {{termination_notice_period}} written notice.

6. Confidentiality
   Both parties agree to maintain the confidentiality of any proprietary information.

7. Governing Law
   This Agreement shall be governed by the laws of {{jurisdiction}}.

Signed:

---

{{client_name}} {{provider_name}}  
(Client) (Service Provider)

Date: ******\_\_\_\_****** Date: ******\_\_\_\_******
`;

const salesContractTemplate = `
SALES AGREEMENT

This Sales Agreement (“Agreement”) is made and entered into on {{date}}, by and between:

Seller: {{seller_name}}, located at {{seller_address}}

and

Buyer: {{buyer_name}}, located at {{buyer_address}}

1. Product Details
   The Seller agrees to sell and the Buyer agrees to purchase the following products:

- Product Name: {{product_name}}
- Quantity: {{product_quantity}}
- Unit Price: {{unit_price}}
- Total Price: {{total_price}}

2. Payment Terms
   Payment shall be made by {{payment_method}} upon {{payment_due_date}}.

3. Delivery
   Products will be delivered to {{delivery_address}} by {{delivery_date}}. Risk of loss passes to Buyer upon delivery.

4. Warranties
   Seller warrants that the goods are free from defects and fit for purpose for a period of {{warranty_period}}.

5. Termination & Returns
   Buyer may return goods within {{return_period}} under the return policy.

6. Governing Law
   This Agreement shall be governed by the laws of {{jurisdiction}}.

Signed:

---

{{buyer_name}} {{seller_name}}  
(Buyer) (Seller)

Date: ******\_\_\_\_****** Date: ******\_\_\_\_******

`;

const employeeContractTemplate = ` 
EMPLOYMENT AGREEMENT

This Employment Agreement is entered into as of {{date}}, between:

Employer: {{employer_name}}, located at {{employer_address}}

and

Employee: {{employee_name}}, residing at {{employee_address}}

1. Position and Duties
   The Employee is hired as a {{position_title}} and shall report to {{supervisor_name}}. The Employee agrees to perform all duties associated with this position.

2. Term
   This Agreement shall commence on {{start_date}} and continue until terminated by either party in accordance with this Agreement.

3. Compensation
   The Employee shall receive a salary of {{salary_amount}} per annum, payable {{payment_schedule}}.

4. Benefits
   The Employee will be entitled to the following benefits: {{benefits_list}}.

5. Confidentiality
   The Employee agrees to maintain confidentiality of all proprietary information.

6. Termination
   This Agreement may be terminated by either party with {{termination_notice_period}} notice.

7. Governing Law
   This Agreement shall be governed by the laws of {{jurisdiction}}.

Signed:

---

{{employee_name}} {{employer_name}}  
(Employee) (Employer)

Date: ******\_\_\_\_****** Date: ******\_\_\_\_******

`;
