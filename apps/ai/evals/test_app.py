from app.main import app


def test_health_import():
    assert app.title == "VitaCircle AI"
