from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html",
                           location="Home")

@app.route("/lowestbandwidths")
def lowest():
    return render_template("lowestbandwidths.html")

@app.route("/highestbandwidths")
def highest():
    return render_template("highestbandwidths.html")

@app.route("/heatmap")
def heatmap():
    return render_template("heatmap.html")

@app.route("/pointsmap")
def pointsmap():
    return render_template("pointsmap.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html",
                           location="Dashboard")

@app.route("/display")
def display():
    return render_template("display.html",
                           location="Display")