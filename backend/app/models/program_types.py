from enum import Enum


class ProgramType(str, Enum):
    BREAK = "BREAK"
    CONFERENCE = "CONFERENCE"
    SPEAKER = "SPEAKER"
    PLENARY = "PLENARY"
    TUTORIAL = "TUTORIAL"
    MISC = "MISC"
