;; Institution Verification Contract
;; Validates legitimate educational entities

(define-data-var admin principal tx-sender)

;; Map to store verified institutions
(define-map verified-institutions
  principal
  {
    name: (string-ascii 100),
    website: (string-ascii 100),
    verified: bool,
    verification-date: uint
  }
)

;; Error codes
(define-constant ERR_NOT_ADMIN u100)
(define-constant ERR_ALREADY_VERIFIED u101)
(define-constant ERR_NOT_FOUND u102)

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Add a new institution
(define-public (add-institution (institution-principal principal) (name (string-ascii 100)) (website (string-ascii 100)))
  (begin
    (asserts! (is-admin) (err ERR_NOT_ADMIN))
    (asserts! (is-none (map-get? verified-institutions institution-principal)) (err ERR_ALREADY_VERIFIED))

    (map-set verified-institutions
      institution-principal
      {
        name: name,
        website: website,
        verified: true,
        verification-date: block-height
      }
    )
    (ok true)
  )
)

;; Revoke institution verification
(define-public (revoke-institution (institution-principal principal))
  (begin
    (asserts! (is-admin) (err ERR_NOT_ADMIN))
    (asserts! (is-some (map-get? verified-institutions institution-principal)) (err ERR_NOT_FOUND))

    (map-delete verified-institutions institution-principal)
    (ok true)
  )
)

;; Check if an institution is verified
(define-read-only (is-verified-institution (institution-principal principal))
  (match (map-get? verified-institutions institution-principal)
    institution (ok (get verified institution))
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
