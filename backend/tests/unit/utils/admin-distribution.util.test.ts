// backend/tests/unit/utils/admin-distribution.util.test.ts
import { distributeToAdmins } from '../../../src/utils/admin-distribution.util';

describe('Admin Request Distribution', () => {
  const mockAdmins = [
    { admin_id: 1, active_requests: 2 },
    { admin_id: 2, active_requests: 1 },
    { admin_id: 3, active_requests: 3 },
  ];

  it('should use round-robin distribution', () => {
    const result1 = distributeToAdmins(mockAdmins);
    expect(result1.admin_id).toBe(2); // Least busy admin

    // Simulate previous assignment
    const updatedAdmins = mockAdmins.map(a => 
      a.admin_id === 2 ? { ...a, active_requests: a.active_requests + 1 } : a
    );

    const result2 = distributeToAdmins(updatedAdmins);
    expect(result2.admin_id).toBe(1); // Next in round-robin
  });

  it('should handle empty admin list', () => {
    expect(() => distributeToAdmins([])).toThrow('No available admins');
  });
});