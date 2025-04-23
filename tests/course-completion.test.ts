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
    "course-completion": {
      functions: {
        "authorize-institution": vi.fn(),
        "revoke-institution": vi.fn(),
        "record-completion": vi.fn(),
        "get-completion": vi.fn(),
        "transfer-admin": vi.fn(),
      },
    },
  },
}

// Setup global mock
global.clarity = mockClarity

describe("Course Completion Contract", () => {
  const adminAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  const institutionAddress = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
  const studentAddress = "ST3CECAKJ4BH08JYY7W53MC81BYDT4YDA5Z7XE5M"
  const nonAdminAddress = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
  
  beforeEach(() => {
    // Reset mocks
    Object.values(mockClarity.contracts["course-completion"].functions).forEach((fn) => fn.mockReset())
    
    // Set default admin
    mockClarity.tx.setSender(adminAddress)
    
    // Setup mock responses
    mockClarity.contracts["course-completion"].functions["authorize-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["course-completion"].functions["revoke-institution"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["course-completion"].functions["record-completion"].mockReturnValue({
      value: true,
      type: "ok",
    })
    mockClarity.contracts["course-completion"].functions["get-completion"].mockReturnValue({
      value: {
        institution: institutionAddress,
        "course-name": "Introduction to Computer Science",
        grade: "A",
        credits: 3,
        "completion-date": 123456,
        verified: true,
      },
      type: "ok",
    })
    mockClarity.contracts["course-completion"].functions["transfer-admin"].mockReturnValue({ value: true, type: "ok" })
  })
  
  it("should allow admin to authorize an institution", () => {
    const result = mockClarity.contracts["course-completion"].functions["authorize-institution"](institutionAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["course-completion"].functions["authorize-institution"]).toHaveBeenCalledWith(
        institutionAddress,
    )
  })
  
  it("should allow admin to revoke an institution", () => {
    const result = mockClarity.contracts["course-completion"].functions["revoke-institution"](institutionAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["course-completion"].functions["revoke-institution"]).toHaveBeenCalledWith(
        institutionAddress,
    )
  })
  
  it("should allow authorized institution to record a course completion", () => {
    // Set sender to institution
    mockClarity.tx.setSender(institutionAddress)
    
    const result = mockClarity.contracts["course-completion"].functions["record-completion"](
        studentAddress,
        "CS101",
        "Introduction to Computer Science",
        "A",
        3,
    )
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["course-completion"].functions["record-completion"]).toHaveBeenCalledWith(
        studentAddress,
        "CS101",
        "Introduction to Computer Science",
        "A",
        3,
    )
  })
  
  it("should not allow unauthorized entity to record a course completion", () => {
    // Set sender to non-admin, non-authorized address
    mockClarity.tx.setSender(nonAdminAddress)
    
    // Mock error response
    mockClarity.contracts["course-completion"].functions["record-completion"].mockReturnValue({
      value: 101, // ERR_NOT_AUTHORIZED
      type: "err",
    })
    
    const result = mockClarity.contracts["course-completion"].functions["record-completion"](
        studentAddress,
        "CS101",
        "Introduction to Computer Science",
        "A",
        3,
    )
    
    expect(result.type).toBe("err")
    expect(result.value).toBe(101) // ERR_NOT_AUTHORIZED
  })
  
  it("should allow retrieving course completion information", () => {
    const result = mockClarity.contracts["course-completion"].functions["get-completion"](studentAddress, "CS101")
    
    expect(result.type).toBe("ok")
    expect(result.value).toEqual({
      institution: institutionAddress,
      "course-name": "Introduction to Computer Science",
      grade: "A",
      credits: 3,
      "completion-date": 123456,
      verified: true,
    })
    expect(mockClarity.contracts["course-completion"].functions["get-completion"]).toHaveBeenCalledWith(
        studentAddress,
        "CS101",
    )
  })
  
  it("should allow admin to transfer admin rights", () => {
    const newAdminAddress = "ST3CECAKJ4BH08JYY7W53MC81BYDT4YDA5Z7XE5M"
    
    const result = mockClarity.contracts["course-completion"].functions["transfer-admin"](newAdminAddress)
    
    expect(result.type).toBe("ok")
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["course-completion"].functions["transfer-admin"]).toHaveBeenCalledWith(newAdminAddress)
  })
})
