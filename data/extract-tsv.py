#!/usr/bin/env python3

import pandas as pd
df = pd.read_csv("./data.tsv", sep='\t')
print(df)
df = df.drop(["tweet_id","author"], axis=1)
df = df.rename(columns={"sentiment":"label"})
df = df.replace({"label":["boredom","empty","worry"]}, "sadness")
df = df.replace({"label":["enthusiasm","fun","love","relief","surprise"]}, "happiness")
df = df.replace({"label":["hate"]},"anger")
classes = sorted(list(set(df['label'].values.reshape(-1))))
for i, val in enumerate(classes):
    df = df.replace({"label":val}, i)
print(df)
print(classes)
df.to_csv("./new_data.csv", index=False)
