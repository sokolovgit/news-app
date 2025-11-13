import { computed, type Ref } from 'vue'

export interface PasswordStrength {
  score: number
  label: string
  color: string
}

export interface PasswordRequirement {
  text: string
  met: boolean
}

export function usePasswordValidation(password: Ref<string>) {
  /**
   * Calculate password strength based on various criteria
   */
  const strength = computed<PasswordStrength>(() => {
    const pwd = password.value || ''
    if (!pwd) return { score: 0, label: '', color: '' }

    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&]/.test(pwd),
    }

    const score = Object.values(checks).filter(Boolean).length

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score === 3) return { score, label: 'Fair', color: 'bg-orange-500' }
    if (score === 4) return { score, label: 'Good', color: 'bg-yellow-500' }
    
    return { score, label: 'Strong', color: 'bg-green-500' }
  })

  /**
   * Get detailed password requirements with met status
   */
  const requirements = computed<PasswordRequirement[]>(() => {
    const pwd = password.value || ''
    return [
      { text: 'At least 8 characters', met: pwd.length >= 8 },
      { text: 'One lowercase letter', met: /[a-z]/.test(pwd) },
      { text: 'One uppercase letter', met: /[A-Z]/.test(pwd) },
      { text: 'One number', met: /\d/.test(pwd) },
      { text: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(pwd) },
    ]
  })

  /**
   * Check if password meets all requirements
   */
  const isValid = computed(() => {
    return requirements.value.every((req) => req.met)
  })

  return {
    strength,
    requirements,
    isValid,
  }
}

