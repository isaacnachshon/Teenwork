# Firestore Database Plan

## Collections

- users
- companies
- jobs
- applications
- messages
- notifications
- reports
- settings

## Core Document Shapes

### users/{uid}
- uid
- displayName
- email
- photoURL
- role
- phone
- city
- birthDate
- profileCompleted
- createdAt
- updatedAt
- lastLogin
- status

### companies/{companyId}
- id
- name
- ownerId
- description
- logoUrl
- createdAt
- updatedAt

### jobs/{jobId}
- id
- employerId
- title
- description
- location
- salary
- requirements
- status
- createdAt
- updatedAt

### applications/{applicationId}
- applicantId
- employerId
- jobId
- status
- appliedAt
- coverLetter

### messages/{messageId}
- senderId
- recipientId
- content
- createdAt
- readAt

### notifications/{notificationId}
- userId
- type
- message
- read
- createdAt

### reports/{reportId}
- reporterId
- targetId
- reason
- createdAt

### settings/{settingId}
- key
- value
- updatedAt
