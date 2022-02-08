import pandas as pd
import numpy as np
import os
from tqdm import tqdm

subsecs = [5, 4, 3, 5, 6]
secTitles = ["Brand", "Policy and commitments", "Governance", "Traceability", "Know, show and fix", "Spotlight issues", "Total"]
secTitles2 = ["Policy and commitments", "Governance", "Traceability", "Know, show and fix", "Spotlight issues"]
total = pd.DataFrame()
totCumulative = pd.DataFrame()
brands = pd.read_csv(os.path.join("./Datasets", "1.1.csv")).iloc[:, 0]
total["Brands"] = brands
maxPerSubsec = pd.read_csv(os.path.join("./Datasets", "max-by-subsection.csv"))
counter = 0
print(">>> ALL PERCENTAGES")
for sec, subsec_n in enumerate(tqdm(subsecs)):
	sec += 1
	for subsec in range(1, subsec_n + 1):
		currSubsec = pd.read_csv(os.path.join("./Datasets", str(sec) + "." + str(subsec) + ".csv"))
		totalSubsec = currSubsec.iloc[:,-1:]
		totCumulative[str(sec) + "." + str(subsec)] = currSubsec.iloc[:,-1:]
		totalSubsec /= maxPerSubsec["Max"].iloc[counter]
		total[maxPerSubsec["Name"].iloc[counter]] = round(totalSubsec, 2)
		counter += 1
# total.to_csv(os.path.join("./Datasets", "allPercentages.csv"))
print(">>> CUMULATIVE")
cumulative = pd.DataFrame(np.zeros((250, 7)), columns=secTitles)
for i in tqdm(range(len(brands))):
	counter = 0
	cumulative["Brand"][i] = brands[i]
	sumBrand = 0
	for sec, subsec_n in enumerate(subsecs):
		sumOfMaxs = 0
		sec += 1
		for subsec in range(1, subsec_n + 1):
			cumulative[secTitles2[sec - 1]][i] += totCumulative[str(sec) + "." + str(subsec)][i]
			sumBrand += totCumulative[str(sec) + "." + str(subsec)][i]
			sumOfMaxs += maxPerSubsec["Max"][counter]
			counter += 1
		cumulative[secTitles2[sec - 1]][i] = round(cumulative[secTitles2[sec - 1]][i] / sumOfMaxs, 2)
	cumulative["Total"][i] = sumBrand / 250
cumulative.to_csv(os.path.join("./Datasets", "percentageBySection.csv"))