import pandas as pd

from flask import Flask, jsonify, render_template

app = Flask(__name__)

samples = pd.read_csv('data/belly_button_data.csv')

sample_metadata = pd.read_csv('data/belly_button_metadata.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/names')
def names():
    return jsonify([id for id in sample_metadata['sample']])

@app.route('/metadata/<int:sample_id>')
def metadata(sample_id):
    sample = sample_metadata.loc[sample_metadata['sample'] == sample_id]
    if not(len(sample)):
        return jsonify({ 'id': None })
    sample = sample.iloc[0]
    return jsonify({
        'id': sample_id,
        'age': sample['AGE'],
        'ethnicity': sample['ETHNICITY'],
        'bbtype': sample['BBTYPE'],
        'gender': sample['GENDER'],
        'location': sample['LOCATION']
    })

@app.route('/samples/<sample_id>')
def sample(sample_id):
    sample = samples.loc[samples[sample_id] > 0, ['otu_id', 'otu_label', sample_id]].sort_values(sample_id, ascending=False)
    data = {
        'ids': [id for id in sample['otu_id']],
        'values': [v for v in sample[sample_id]],
        'labels': [l for l in sample['otu_label']],
        'id': sample_id
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
