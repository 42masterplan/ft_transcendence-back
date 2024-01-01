export class Achievement {
  private readonly _id: number;
  private readonly _name: string;
  private readonly _criterionNumber: number;

  constructor(param: {
    id: number;
    name: string;
    criterionNumber: number;
  }) {
    this._id = param.id;
    this._name = param.name;
    this._criterionNumber = param.criterionNumber;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get criterionNumber(): number {
    return this._criterionNumber;
  }
}