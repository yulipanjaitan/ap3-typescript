import { UserAccount, PerkaraRecord, DisposisiRecord } from '../types/index.js';
export interface IDatabase {
    getUsers(): UserAccount[];
    getUserByEmail(email: string): UserAccount | undefined;
    createUser(user: UserAccount): UserAccount;
    getAllPerkara(): PerkaraRecord[];
    getPerkaraById(id: number): PerkaraRecord | undefined;
    savePerkara(rec: PerkaraRecord, index?: number): PerkaraRecord[];
    replacePerkaraList(list: PerkaraRecord[]): void;
    deletePerkara(indexOrId: number): PerkaraRecord[];
    resetPerkara(): void;
    getDisposisi(): DisposisiRecord[];
    saveDisposisi(disp: DisposisiRecord): DisposisiRecord;
}
export declare const db: IDatabase;
