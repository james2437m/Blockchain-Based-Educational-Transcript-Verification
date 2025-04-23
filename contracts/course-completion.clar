;; Course Completion Contract
;; Records academic achievements

(define-data-var admin principal tx-sender)

;; Structure for course completion records
(define-map course-completions
  {
    student: principal,
    course-id: (string-ascii 50)
  }
  {
    institution: principal,
    course-name: (string-ascii 100),
    grade: (string-ascii 10),
    credits: uint,
    completion-date: uint,
    verified: bool
  }
)

;; Map to track institutions allowed to add course completions
(define-map authorized-institutions principal bool)

;; Error codes
(define-constant ERR_NOT_ADMIN u100)
(define-constant ERR_NOT_AUTHORIZED u101)
(define-constant ERR_ALREADY_RECORDED u102)
(define-constant ERR_NOT_FOUND u103)

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Check if caller is authorized institution
(define-private (is-authorized-institution)
  (default-to false (map-get? authorized-institutions tx-sender))
)

;; Authorize an institution to record course completions
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

;; Record a course completion
(define-public (record-completion
  (student principal)
  (course-id (string-ascii 50))
  (course-name (string-ascii 100))
  (grade (string-ascii 10))
  (credits uint))
  (begin
    (asserts! (or (is-admin) (is-authorized-institution)) (err ERR_NOT_AUTHORIZED))
    (asserts! (is-none (map-get? course-completions {student: student, course-id: course-id})) (err ERR_ALREADY_RECORDED))

    (map-set course-completions
      {student: student, course-id: course-id}
      {
        institution: tx-sender,
        course-name: course-name,
        grade: grade,
        credits: credits,
        completion-date: block-height,
        verified: true
      }
    )
    (ok true)
  )
)

;; Get course completion record
(define-read-only (get-completion (student principal) (course-id (string-ascii 50)))
  (match (map-get? course-completions {student: student, course-id: course-id})
    completion (ok completion)
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
