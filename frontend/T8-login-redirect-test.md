\# T8 Login and Redirect Tests



\## Test Objective



Verify that the login flow correctly authenticates users and redirects them to the dashboard corresponding to their role.



\## Test Cases



| Test Case | Expected Result | Status |

|---|---|---|

| Client login with valid credentials | Redirects to client dashboard | PASS |

| Freelancer login with valid credentials | Redirects to freelancer dashboard | PASS |

| Login with incorrect password | Displays invalid email or password message | PASS |

| Login with empty email | Displays email validation message | PASS |

| Login with empty password | Displays password validation message | PASS |

| Login with password shorter than 8 characters | Displays password validation message | PASS |



\## Result



All T8 login and role-based redirect test cases passed successfully.



\## Conclusion



The login flow correctly validates credentials, authenticates users through the backend, generates a JWT, and redirects users to the appropriate dashboard based on their role.

