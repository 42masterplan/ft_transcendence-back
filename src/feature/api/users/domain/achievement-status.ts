export class AchievementStatus {
  private readonly _id: number;
  private readonly _userId: string;
  private readonly _achievementId: number;
  private _count: number;
  private _isAchieved: boolean;

  constructor(props: {
    id: number;
    userId: string;
    achievementId: number;
    count: number;
    isAchieved: boolean;
  }) {
    this._id = props.id;
    this._userId = props.userId;
    this._achievementId = props.achievementId;
    this._count = props.count;
    this._isAchieved = props.isAchieved;
  }

  get id(): number {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get achievementId(): number {
    return this._achievementId;
  }

  get count(): number {
    return this._count;
  }

  get isAchieved(): boolean {
    return this._isAchieved;
  }

  updateCount(count: number): AchievementStatus {
    this._count = count;
    return this;
  }

  updateIsAchieved(isAchieved: boolean): AchievementStatus {
    this._isAchieved = isAchieved;
    return this;
  }
}