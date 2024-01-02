import { LadderMatch } from './ladder-match';

export class LadderMatchQueue {
  private _head: LadderMatch = null;
  private _tail: LadderMatch = null;
  private _size: number = 0;

  private createArray(): Array<LadderMatch> {
    const array: Array<LadderMatch> = [];

    if (this.isEmpty()) {
      return array;
    }

    let current = this._head;
    array.push(current);
    while (current.next) {
      current = current.next;
      array.push(current);
    }

    return array;
  }

  tickQueue(): void {
    if (this.isEmpty()) {
      return;
    }

    let current = this._head;
    current.time++;
    while (current.next) {
      current = current.next;
      current.time++;
    }
  }

  getMatchArrayByTime(): Array<LadderMatch> {
    const array: Array<LadderMatch> = this.createArray();
    return array.sort((a, b) => (a.time > b.time ? -1 : 1));
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  insert(newMatch: LadderMatch) {
    if (!this._head) {
      this._head = newMatch;
      this._tail = newMatch;
      this._size++;
      return;
    }
    let current = this._head;

    while (current) {
      if (
        newMatch.tierNum < current.tierNum ||
        (newMatch.tierNum === current.tierNum && newMatch.exp <= current.exp)
      ) {
        newMatch.next = current;
        newMatch.prev = current.prev;

        if (current.prev) {
          current.prev.next = newMatch;
        } else {
          this._head = newMatch;
        }
        current.prev = newMatch;
        this._size++;
        return;
      }

      if (!current.next) {
        newMatch.prev = current;
        current.next = newMatch;
        this._tail = newMatch;
        this._size++;
        return;
      }

      current = current.next;
    }
  }

  private removeFront() {
    if (this.isEmpty()) {
      console.log('queue is empty!');
      return;
    }

    if (!this._head.next) {
      this._head = null;
      this._tail = null;
      this._size = 0;
      return;
    }

    const nextNode = this._head.next;

    this._head = nextNode;
    nextNode.prev = null;

    this._size--;
  }

  private removeBack() {
    if (this.isEmpty()) {
      console.log('list is empty!');
      return;
    }

    if (!this._tail.prev) {
      this._head = null;
      this._tail = null;
      this._size = 0;
      return;
    }

    const prevNode = this._tail.prev;

    this._tail = prevNode;
    prevNode.next = null;

    this._size--;
  }

  remove(match: LadderMatch) {
    let current = this._head;
    while (current) {
      if (current === match) {
        current.removed = true;
        if (current === this._head) {
          this.removeFront();
        } else if (current === this._tail) {
          this.removeBack();
        } else {
          current.prev.next = current.next;
          current.next.prev = current.prev;
          current.prev = null;
          current.next = null;

          this._size--;
        }
        console.log('remove success!');
        return;
      }
      current = current.next;
    }
    console.log('cannot remove anything!');
  }

  removeUserMatch(userSocketId: string) {
    let current = this._head;
    while (current) {
      if (current.socketId === userSocketId) {
        current.removed = true;
        if (current === this._head) {
          this.removeFront();
        } else if (current === this._tail) {
          this.removeBack();
        } else {
          current.prev.next = current.next;
          current.next.prev = current.prev;
          current.prev = null;
          current.next = null;

          this._size--;
        }
        console.log('remove success!');
        return;
      }
      current = current.next;
    }
    console.log('cannot remove anything!');
  }
}
