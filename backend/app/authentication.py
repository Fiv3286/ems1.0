import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta


class AuthHandler:
    security = HTTPBearer()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    secret = "ThisIsASecretString"
    blacklist = set()

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def encode_token(self, user_id, user_role):
        payload = {
            "exp": datetime.utcnow() + timedelta(days=0, hours=1, minutes=0, seconds=0),
            "iat": datetime.utcnow(),
            'scope': 'access_token',
            "sub": user_id,
            'role': user_role
        }
        return jwt.encode(payload, self.secret, algorithm="HS256")

    def decode_token(self, token):
        try:
            if self.is_revoked(token):
                raise HTTPException(status_code=401, detail="Invalid token (Revoked)")
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            if (payload['scope'] == 'access_token') | (payload['scope'] == 'refresh_token'):
                return payload['sub']
            raise HTTPException(status_code=401, detail='Scope for the token is invalid')
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Signature has expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail="Invalid token")

            
    def revoke_token(self, token) -> int:
        try:            
            self.blacklist.add(token)
            #print(f"revoked: blacklist = {self.blacklist}")
            return 1  
        except jwt.ExpiredSignatureError:
            #raise HTTPException(status_code=401, detail="Signature has expired")
            return 2
        except jwt.InvalidTokenError as e:
            #raise HTTPException(status_code=401, detail="Invalid token")
            return 3
        
    def is_revoked(self, token) -> bool:
        if token in self.blacklist:
            return True
        else:
            return False
        
    def update_blacklist(self) -> set:
        if len(self.blacklist) > 0: 
            cpy_blacklist = self.blacklist.copy()
            for token in self.blacklist:
                try:
                    jwt.decode(token, self.secret, algorithms=["HS256"])
                except jwt.ExpiredSignatureError:
                    cpy_blacklist.remove(token)
                except jwt.DecodeError:
                    cpy_blacklist.remove(token)
            self.blacklist = cpy_blacklist
        return self.blacklist

    def auth_wrapper(self, auth: HTTPAuthorizationCredentials = Security(security)):
        return self.decode_token(auth.credentials)

    # Ref: https://github.com/rohanshiva/Deta-FastAPI-JWT-Auth-Blog/blob/main/auth.py
    def encode_refresh_token(self, user_id, user_role):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=0, hours=10, seconds=0),
            'iat': datetime.utcnow(),
            'scope': 'refresh_token',
            'sub': user_id,
            'role': user_role
        }
        return jwt.encode(payload, self.secret, algorithm="HS256")

    def refresh_token(self, token):
        try:
            if self.is_revoked(token):
                raise HTTPException(status_code=401, detail="Invalid token (Revoked)")
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            if (payload['scope'] == 'refresh_token'):
                user_id = payload['sub']
                user_role = payload['role']
                new_token = self.encode_token(user_id, user_role)
                return new_token, user_id
            raise HTTPException(status_code=401, detail='Invalid scope for token')
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail='Refresh token expired')
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail='Invalid refresh token')