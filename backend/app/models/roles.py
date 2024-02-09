from enum import Enum


class Role(str, Enum):
    NON_ADMIN = "non_admin"
    ADMIN = "admin"

    #def set_role(input:str):
