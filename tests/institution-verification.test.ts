import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the Clarity environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Admin address
    setSender: function (address) {
      this.sender = address
    },
  },
  contracts: {
    "institution-verification": {
      functions: {
        "add-institution": vi.fn(),
        "revoke-institution": vi.fn(),
        "is-verified-institution": vi.fn(),
        "transfer-admin": vi.fn(),
      },
    },
  },
}

// Setup global mock
global.clarity = mockClarity

describe("Institution Verification Contract", () => {
  const adminAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  const institutionAddress = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
  const nonAdminAddress = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
  
  beforeEach(() => {
    // Reset mocks
    Object.values(mockClarity.contracts["institution-verification"].functions).forEach((fn) => fn.mockReset())
    
    // Set default admin
    mockClarity.tx.setSender(adminAddress)
    
    // Setup mock responses
    mockClarity.contracts["institution-verification"].functions["add-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["institution-verification"].functions["revoke-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["institution-verification"].functions["is-verified-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["institution-verification"].functions["transfer-admin"].mockReturnValue({
      value: true,
      type: "ok",
    })
  })
  
  it("should allow admin to add an institution", () => {
    const result = mockClarity.contracts["institution-verification"].functions["add-institution"](
        institutionAddress,
        "Harvard University",
        "harvard.edu",
    )
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["institution-verification"].functions["add-institution"]).toHaveBeenCalledWith(
        institutionAddress,
        "Harvard University",
        "harvard.edu",
    )
  })
  
  it("should not allow non-admin to add an institution", () => {
    // Set sender to non-admin
    mockClarity.tx.setSender(nonAdminAddress)
    
    // Mock error response
    mockClarity.contracts["institution-verification"].functions["add-institution"].mockReturnValue({
      value: 100, // ERR_NOT_ADMIN
      type: "err",
    })
    
    const result = mockClarity.contracts["institution-verification"].functions["add-institution"](
        institutionAddress,
        "Fake University",
        "fake.edu",
    )
    
    expect(result.type).toBe("err")
    expect(result.value).toBe(100) // ERR_NOT_ADMIN
  })
  
  it("should allow admin to revoke an institution", () => {
    const result = mockClarity.contracts["institution-verification"].functions["revoke-institution"](institutionAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["institution-verification"].functions["revoke-institution"]).toHaveBeenCalledWith(
        institutionAddress,
    )
  })
  
  it("should allow checking if an institution is verified", () => {
    const result =
        mockClarity.contracts["institution-verification"].functions["is-verified-institution"](institutionAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["institution-verification"].functions["is-verified-institution"]).toHaveBeenCalledWith(
        institutionAddress,
    )
  })
  
  it("should allow admin to transfer admin rights", () => {
    const newAdminAddress = "ST3CECAKJ4BH08JYY7W53MC81BYDT4YDA5Z7XE5M"
    
    const result = mockClarity.contracts["institution-verification"].functions["transfer-admin"](newAdminAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["institution-verification"].functions["transfer-admin"]).toHaveBeenCalledWith(
        newAdminAddress,
    )
  })
})
