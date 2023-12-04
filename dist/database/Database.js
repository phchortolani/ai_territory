"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Database_table;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sql_1 = __importDefault(require("./sql"));
class Database {
    constructor({ options }) {
        _Database_table.set(this, void 0);
        __classPrivateFieldSet(this, _Database_table, options.table, "f");
    }
    create(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                delete obj.id;
                const keys = Object.keys(obj);
                const created = yield (0, sql_1.default) `insert into ${(0, sql_1.default)(__classPrivateFieldGet(this, _Database_table, "f"))} ${(0, sql_1.default)(obj, keys)} returning *`;
                console.log('created', created);
                return created;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    update(id, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = Object.keys(obj);
                const updated = yield (0, sql_1.default) `update ${(0, sql_1.default)(__classPrivateFieldGet(this, _Database_table, "f"))} set ${(0, sql_1.default)(obj, keys)} where id = ${id}`;
                console.log('updated: ', updated.count > 0);
                return updated.count > 0;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = yield (0, sql_1.default) `delete from ${(0, sql_1.default)(__classPrivateFieldGet(this, _Database_table, "f"))}
            where id is not null ${id ? (0, sql_1.default) `and id = ${id}` : (0, sql_1.default) ``}`;
                console.log('delete_status: ', query.count > 0);
                return query.count > 0;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    list(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const list = yield (0, sql_1.default) `select * from ${(0, sql_1.default)(__classPrivateFieldGet(this, _Database_table, "f"))} 
            where id is not null ${id ? (0, sql_1.default) `and id = ${id}` : (0, sql_1.default) ``}`;
                return list;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
}
exports.Database = Database;
_Database_table = new WeakMap();
