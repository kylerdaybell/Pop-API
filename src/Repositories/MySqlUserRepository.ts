import { IUserRepository } from "./IUserRepository";
import { User } from "../Models/UserModel";
const mysql2 = require("mysql2/promise")

export class MySqlUserRepository implements IUserRepository{
    public async getConnection(){
        const con = await mysql2.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password:process.env.DB_PASSWORD,
            database:process.env.DB_DATABASE
            
        })
        return con
    }
    public async AddNewUser(user:User):Promise<any>{
        if(user.email != "" && user.password!=""){
            const con = await this.getConnection();
            try{
                var [rows] = await con.execute('INSERT INTO USER (EMAIL,PASSWORD,ROLE) VALUE (?,?,?)', [user.email, user.password, user.authorization])
                return Promise.resolve(true);
            }catch(error){
                return Promise.resolve(false);
            }finally{
                con.end();
            }
        }
    }
    public async GetExsistingUser(user: User):Promise<User> {
        const con = await this.getConnection();
        var [rows] = await con.execute('SELECT * from USER where EMAIL = ?', [user.email]);
        con.end()
        if(typeof rows[0] === 'undefined'){
            let DBuser = new User(null,"void","void","none")
            return Promise.resolve(DBuser);
        }else{
            let DBuser = new User(rows[0].ID,rows[0].EMAIL,rows[0].PASSWORD,rows[0].ROLE)
            return Promise.resolve(DBuser);
        }
    }    
    public async RemoveUser(user: User): Promise<any> {
        const con = await this.getConnection();
        try{
            var [rows] = await con.execute('Delete from USER where EMAIL = ?', [user.email]);
            return Promise.resolve(true);
        }catch(error){
            return Promise.resolve(false);
        }finally{
            con.end()
        }
    }
}