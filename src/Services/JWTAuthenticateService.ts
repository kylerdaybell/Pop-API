import { Request, Response } from "express";
import { User } from "../Models/UserModel";
import { IAuthenticationService } from "./IAuthenticationService";
import { IUserService } from "./IUserService";
const jwt = require("jsonwebtoken");

export class JWTAuthenticationService implements IAuthenticationService {
    private iuserservice: IUserService;
    constructor( iuserservice: IUserService) {
        this.iuserservice = iuserservice;
    }

    public async AuthenticateUser(req: Request, res: Response): Promise<void> {
        const user  = new User(null, req.body.User.Email, req.body.User.Password, "none");
        const DBUser = await this.iuserservice.ValidateUser(user);
        if (await this.iuserservice.ValidateUser(user)) {
            const tokenUser = {email: user.email, authorization: DBUser.authorization};
            const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN);
            res.json({accessToken});
        }
    }

    public async AuthorizeToken(req: Request, res: Response, authorizationLevel: string): Promise<User|null> {
        const user = await this.AuthenticateToken(req, res);
        if (user.authorization == authorizationLevel) {
            return user;
        }
        return null;
    }

    public async AuthenticateToken(req: Request, res: Response): Promise<User|null> {
        if (await this.TokenIsValid(req, res)) {
            const token = this.GetToken(req, res);
            const decoded = jwt.decode(token, {complete: true});
            const user = new User(null, decoded.payload.email, "", decoded.payload.authorization);
            return user;
        }
        return null;
    }

    private async TokenIsValid(req: Request, res: Response): Promise<boolean> {
        try {
            const token = this.GetToken(req, res);
            if (token == null) {
                res.sendStatus(401);
                throw new Error("token null");
            }
            jwt.verify(token, process.env.ACCESS_TOKEN, (err: any, user: any) => {
                if (err) {
                    res.sendStatus(403);
                    throw new Error("Invalid Token");
                }
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    private GetToken(req: Request, res: Response): any {
        const authHeader = req.headers.authorization;
        console.log(process.env.ACCESS_TOKEN);
        const token = authHeader && authHeader.split(" ")[1];
        return token;
    }
}
