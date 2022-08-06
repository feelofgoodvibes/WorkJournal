import enum

class Position(enum.Enum):
    junior = "Junior"
    middle = "Middle"
    senior = "Senior"

print(Position.junior.value)