;; Student Identity Contract
;; Securely manages learner information

(define-data-var admin principal tx-sender)

;; Map to store student identities
(define-map students
  principal
  {
    name: (string-ascii 100),
    id: (string-ascii 50),
    registered-by: principal,
    registration-date: uint
  }
)

;; Map to track institutions allowed to register students
(define-map authorized-institutions principal bool)

;; Error codes
(define-constant ERR_NOT_ADMIN u100)
(define-constant ERR_NOT_AUTHORIZED u101)
(define-constant ERR_ALREADY_REGISTERED u102)
(define-constant ERR_NOT_FOUND u103)

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Check if caller is authorized institution
(define-private (is-authorized-institution)
  (default-to false (map-get? authorized-institutions tx-sender))
)

;; Authorize an institution to register students
(define-public (authorize-institution (institution-principal principal))
  (begin
    (asserts! (is-admin) (err ERR_NOT_ADMIN))
    (map-set authorized-institutions institution-principal true)
    (ok true)
  )
)

;; Revoke institution authorization
(define-public (revoke-institution (institution-principal principal))
  (begin
    (asserts! (is-admin) (err ERR_NOT_ADMIN))
    (map-delete authorized-institutions institution-principal)
    (ok true)
  )
)

;; Register a new student
(define-public (register-student (student-principal principal) (name (string-ascii 100)) (id (string-ascii 50)))
  (begin
    (asserts! (or (is-admin) (is-authorized-institution)) (err ERR_NOT_AUTHORIZED))
    (asserts! (is-none (map-get? students student-principal)) (err ERR_ALREADY_REGISTERED))

    (map-set students
      student-principal
      {
        name: name,
        id: id,
        registered-by: tx-sender,
        registration-date: block-height
      }
    )
    (ok true)
  )
)

;; Get student information
(define-read-only (get-student (student-principal principal))
  (match (map-get? students student-principal)
    student (ok student)
    (err ERR_NOT_FOUND)
  )
)

;; Transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR_NOT_ADMIN))
    (var-set admin new-admin)
    (ok true)
  )
)
