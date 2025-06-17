import { User, ReferralRelation } from '../../types';

export class ReferralNetworkTree {
  private network: Map<string, User> = new Map();
  private relations: ReferralRelation[] = [];
  
  constructor(users: User[], relations: ReferralRelation[]) {
    users.forEach(user => this.network.set(user.userId, user));
    this.relations = relations;
  }
  
  public getDirectInvites(userId: string): User[] {
    return this.relations
      .filter(rel => rel.inviterId === userId && rel.level === 1)
      .map(rel => this.network.get(rel.inviteeId)!)
      .filter(Boolean);
  }
  
  public getNetworkCount(userId: string): {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    total: number;
  } {
    const level1 = this.relations.filter(r => r.inviterId === userId && r.level === 1).length;
    const level2 = this.relations.filter(r => r.inviterId === userId && r.level === 2).length;
    const level3 = this.relations.filter(r => r.inviterId === userId && r.level === 3).length;
    const level4 = this.relations.filter(r => r.inviterId === userId && r.level === 4).length;
    
    return {
      level1,
      level2,
      level3,
      level4,
      total: level1 + level2 + level3 + level4
    };
  }
  
  public getFullNetwork(userId: string, maxLevel = 4): User[] {
    const result: User[] = [];
    const queue: { userId: string; level: number }[] = [{ userId, level: 0 }];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.level > maxLevel) continue;
      
      if (current.level > 0) {
        const user = this.network.get(current.userId);
        if (user) result.push(user);
      }
      
      const invites = this.relations
        .filter(r => r.inviterId === current.userId && r.level === 1)
        .map(r => r.inviteeId);
      
      invites.forEach(inviteeId => {
        queue.push({ userId: inviteeId, level: current.level + 1 });
      });
    }
    
    return result;
  }
  
  public calculatePotentialEarnings(userId: string): {
    daily: number;
    weekly: number;
    monthly: number;
  } {
    const network = this.getFullNetwork(userId);
    const dailyEarnings = network.reduce((sum, user) => {
      const vipLevel = user.vipLevel;
      const dailyRate = [
        20,    // VIP 0
        40,    // VIP 1
        100,   // VIP 2
        200,   // VIP 3
        400,   // VIP 4
        700,   // VIP 5
        1100,  // VIP 6
        2000,  // VIP 7
        4000   // VIP 8
      ][vipLevel];
      
      return sum + dailyRate;
    }, 0);
    
    return {
      daily: dailyEarnings,
      weekly: dailyEarnings * 7,
      monthly: dailyEarnings * 30
    };
  }
}