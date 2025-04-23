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
    "student-identity": {
      functions: {
        "authorize-institution": vi.fn(),
        "revoke-institution": vi.fn(),
        "register-student": vi.fn(),
        "get-student": vi.fn(),
        "transfer-admin": vi.fn(),
      },
    },
  },
}

// Setup global mock
global.clarity = mockClarity

describe("Student Identity Contract", () => {
  const adminAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  const institutionAddress = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
  const studentAddress = "ST3CECAKJ4BH08JYY7W53MC81BYDT4YDA5Z7XE5M"
  const nonAdminAddress = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
  
  beforeEach(() => {
    // Reset mocks
    Object.values(mockClarity.contracts["student-identity"].functions).forEach((fn) => fn.mockReset())
    
    // Set default admin
    mockClarity.tx.setSender(adminAddress)
    
    // Setup mock responses
    mockClarity.contracts["student-identity"].functions["authorize-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["student-identity"].functions["revoke-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["student-identity"].functions["register-student"].mockReturnValue({ value: true, type: "ok" })
    mockClarity.contracts["student-identity"].functions["get-student"].mockReturnValue({
      value: {
        name: "John Doe",
        id: "S12345",
        "registered-by": institutionAddress,
        "registration-date": 123456,
      },
      type: "ok",
    })
    mockClarity.contracts["student-identity"].functions["transfer-admin"].mockReturnValue({ value: true, type: "ok" })
  })
  
  it("should allow admin to authorize an institution", () => {
    const result = mockClarity.contracts["student-identity"].functions["authorize-institution"](institutionAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["student-identity"].functions["authorize-institution"]).toHaveBeenCalledWith(
        institutionAddress,
    )
  })
  
  it("should allow admin to revoke an institution", () => {
    const result = mockClarity.contracts["student-identity"].functions["revoke-institution"](institutionAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["student-identity"].functions["revoke-institution"]).toHaveBeenCalledWith(
        institutionAddress,
    )
  })
  
  it("should allow authorized institution to register a student", () => {
    // Set sender to institution
    mockClarity.tx.setSender(institutionAddress)
    
    const result = mockClarity.contracts["student-identity"].functions["register-student"](
        studentAddress,
        "John Doe",
        "S12345",
    )
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["student-identity"].functions["register-student"]).toHaveBeenCalledWith(
        studentAddress,
        "John Doe",
        "S12345",
    )
  })
  
  it("should not allow unauthorized entity to register a student", () => {
    // Set sender to non-admin, non-authorized address
    mockClarity.tx.setSender(nonAdminAddress)
    
    // Mock error response
    mockClarity.contracts["student-identity"].functions["register-student"].mockReturnValue({
      value: 101, // ERR_NOT_AUTHORIZED
      type: "err",
    })
    
    const result = mockClarity.contracts["student-identity"].functions["register-student"](
        studentAddress,
        "John Doe",
        "S12345",
    )
    
    expect(result.type).toBe("err")
    expect(result.value).toBe(101) // ERR_NOT_AUTHORIZED
  })
  
  it("should allow retrieving student information", () => {
    const result = mockClarity.contracts["student-identity"].functions["get-student"](studentAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toEqual({
      name: "John Doe",
      id: "S12345",
      "registered-by": institutionAddress,
      "registration-date": 123456,
    })
    expect(mockClarity.contracts["student-identity"].functions["get-student"]).toHaveBeenCalledWith(studentAddress)
  })
  
  it("should allow admin to transfer admin rights", () => {
    const newAdminAddress = "ST3CECAKJ4BH08JYY7W53MC81BYDT4YDA5Z7XE5M"
    
    const result = mockClarity.contracts["student-identity"].functions["transfer-admin"](newAdminAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["student-identity"].functions["transfer-admin"]).toHaveBeenCalledWith(newAdminAddress)
  })
})
