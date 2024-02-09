from enum import Enum


class PcStatus(str, Enum):
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    PENDING = "PENDING",
    RESERVED = "RESERVED"
