import { useLocation } from "wouter";
import {
  RetirementFund,
  UpdateRetirementFund,
  ClientDetails,
} from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EntityOwnerSelector from "@/components/common/entity-owner-selector";
import EntityBeneficiarySelector from "@/components/common/entity-beneficiary-selector";
import {
  FieldGroup,
  FormField,
  GroupedDetailForm,
} from "@/components/common/grouped-detail-form";
import { getFieldClass } from "@/lib/design-tokens";
import { getValueClass, handleDefaultValueFocus } from "@/lib/formatting";
import {
  formatCurrencyValue,
  formatPercentageValue,
  formatYearsValue,
} from "@/lib/formatting";
import { useRetirementProjection } from "@/hooks/use-retirement-projection";
import { useValueMode } from "@/components/common/value-mode";

interface RetirementFundDetailFormProps {
  fund: RetirementFund;
  onUpdate: (id: number, field: keyof UpdateRetirementFund, value: any) => void;
  disabled?: boolean;
}

export function RetirementFundDetailForm({
  fund,
  onUpdate,
  disabled = false,
}: RetirementFundDetailFormProps) {
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });
  const [location] = useLocation();
  const showRetirementProjection = location.startsWith("/needs/retirement");
  const { data: projection } = useRetirementProjection();
  const perVehicle = showRetirementProjection
    ? projection?.retirementFunds.find((f) => f.id === fund.id)
    : undefined;
  const { mode } = useValueMode();
  const atRetirement = mode === "atRetirement";
  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  // Text field handlers
  const handleTextFieldBlur = (
    field: keyof UpdateRetirementFund,
    value: string
  ) => {
    if (
      field === "coverAmount" ||
      field === "monthlyIncome" ||
      field === "approvedLifeCover" ||
      field === "fundValue" ||
      field === "lumpSumTaken" ||
      field === "nonDeductibleContribution" ||
      field === "monthlyContribution"
    ) {
      const formattedValue = formatCurrencyValue(value);
      onUpdate(fund.id, field, formattedValue);
    } else if (field === "termYears" || field === "incomeTerm") {
      const formattedValue = formatYearsValue(value);
      onUpdate(fund.id, field, formattedValue);
    } else if (
      field === "increasePercentage" ||
      field === "contributionEscalation" ||
      field === "growthRate" ||
      field === "lumpSumPercent"
    ) {
      const formattedValue = formatPercentageValue(value);
      onUpdate(fund.id, field, formattedValue);
    } else {
      onUpdate(fund.id, field, value);
    }
  };

  // Owner management
  const onOwnerChange = (
    fundId: number,
    ownerIndex: number,
    newOwner: string
  ) => {
    const updatedOwners = [...fund.owners];
    updatedOwners[ownerIndex] = newOwner;
    onUpdate(fundId, "owners", updatedOwners);
  };

  const onOwnershipPercentageChange = (
    fundId: number,
    ownerIndex: number,
    newPercentage: string
  ) => {
    const updatedPercentages = [...fund.ownershipPercentages];
    updatedPercentages[ownerIndex] = newPercentage;
    onUpdate(fundId, "ownershipPercentages", updatedPercentages);
  };

  const onAddOwner = (fundId: number) => {
    const updatedOwners = [...fund.owners, ""];
    const updatedPercentages = [...fund.ownershipPercentages, "0%"];
    onUpdate(fundId, "owners", updatedOwners);
    onUpdate(fundId, "ownershipPercentages", updatedPercentages);
  };

  const onRemoveOwner = (fundId: number, ownerIndex: number) => {
    if (fund.owners.length > 1) {
      const updatedOwners = fund.owners.filter(
        (_, index) => index !== ownerIndex
      );
      const updatedPercentages = fund.ownershipPercentages.filter(
        (_, index) => index !== ownerIndex
      );
      onUpdate(fundId, "owners", updatedOwners);
      onUpdate(fundId, "ownershipPercentages", updatedPercentages);
    }
  };

  // Unapproved beneficiary management
  const onUnapprovedBeneficiaryChange = (
    fundId: number,
    beneficiaryIndex: number,
    newBeneficiary: string
  ) => {
    const updatedBeneficiaries = [...fund.unapprovedBeneficiaries];
    updatedBeneficiaries[beneficiaryIndex] = newBeneficiary;
    onUpdate(fundId, "unapprovedBeneficiaries", updatedBeneficiaries);
  };

  const onUnapprovedPercentageChange = (
    fundId: number,
    beneficiaryIndex: number,
    newPercentage: string
  ) => {
    const updatedPercentages = [...fund.unapprovedPercentageSplits];
    updatedPercentages[beneficiaryIndex] = newPercentage;
    onUpdate(fundId, "unapprovedPercentageSplits", updatedPercentages);
  };

  const onAddUnapprovedBeneficiary = (fundId: number) => {
    const updatedBeneficiaries = [...fund.unapprovedBeneficiaries, ""];
    const updatedPercentages = [...fund.unapprovedPercentageSplits, "0%"];
    const updatedCoverSplits = [...fund.unapprovedCoverSplits, "R 0"];
    onUpdate(fundId, "unapprovedBeneficiaries", updatedBeneficiaries);
    onUpdate(fundId, "unapprovedPercentageSplits", updatedPercentages);
    onUpdate(fundId, "unapprovedCoverSplits", updatedCoverSplits);
  };

  const onRemoveUnapprovedBeneficiary = (
    fundId: number,
    beneficiaryIndex: number
  ) => {
    if (fund.unapprovedBeneficiaries.length > 1) {
      const updatedBeneficiaries = fund.unapprovedBeneficiaries.filter(
        (_, index) => index !== beneficiaryIndex
      );
      const updatedPercentages = fund.unapprovedPercentageSplits.filter(
        (_, index) => index !== beneficiaryIndex
      );
      const updatedCoverSplits = fund.unapprovedCoverSplits.filter(
        (_, index) => index !== beneficiaryIndex
      );
      onUpdate(fundId, "unapprovedBeneficiaries", updatedBeneficiaries);
      onUpdate(fundId, "unapprovedPercentageSplits", updatedPercentages);
      onUpdate(fundId, "unapprovedCoverSplits", updatedCoverSplits);
    }
  };

  // Fund value beneficiary management
  const onFundValueBeneficiaryChange = (
    fundId: number,
    beneficiaryIndex: number,
    newBeneficiary: string
  ) => {
    const updatedBeneficiaries = [...fund.fundValueBeneficiaries];
    updatedBeneficiaries[beneficiaryIndex] = newBeneficiary;
    onUpdate(fundId, "fundValueBeneficiaries", updatedBeneficiaries);
  };

  const onFundValuePercentageChange = (
    fundId: number,
    beneficiaryIndex: number,
    newPercentage: string
  ) => {
    const updatedPercentages = [...fund.fundValuePercentageSplits];
    updatedPercentages[beneficiaryIndex] = newPercentage;
    onUpdate(fundId, "fundValuePercentageSplits", updatedPercentages);
  };

  const onAddFundValueBeneficiary = (fundId: number) => {
    const updatedBeneficiaries = [...fund.fundValueBeneficiaries, ""];
    const updatedPercentages = [...fund.fundValuePercentageSplits, "0%"];
    const updatedCoverSplits = [...fund.fundValueCoverSplits, "R 0"];
    onUpdate(fundId, "fundValueBeneficiaries", updatedBeneficiaries);
    onUpdate(fundId, "fundValuePercentageSplits", updatedPercentages);
    onUpdate(fundId, "fundValueCoverSplits", updatedCoverSplits);
  };

  const onRemoveFundValueBeneficiary = (
    fundId: number,
    beneficiaryIndex: number
  ) => {
    if (fund.fundValueBeneficiaries.length > 1) {
      const updatedBeneficiaries = fund.fundValueBeneficiaries.filter(
        (_, index) => index !== beneficiaryIndex
      );
      const updatedPercentages = fund.fundValuePercentageSplits.filter(
        (_, index) => index !== beneficiaryIndex
      );
      const updatedCoverSplits = fund.fundValueCoverSplits.filter(
        (_, index) => index !== beneficiaryIndex
      );
      onUpdate(fundId, "fundValueBeneficiaries", updatedBeneficiaries);
      onUpdate(fundId, "fundValuePercentageSplits", updatedPercentages);
      onUpdate(fundId, "fundValueCoverSplits", updatedCoverSplits);
    }
  };

  // Retirement-need view: minimal single-row form per the client's reference.
  // DEL-specific fields (multi-owner table, life cover, beneficiary
  // distributions) are not relevant here and would clutter the projection
  // story. The underlying schema still holds those fields — they just
  // don't surface on /needs/retirement routes.
  if (showRetirementProjection) {
    const entityList = entities.filter(
      (e) => e.entityName && e.entityName.trim()
    );
    const primaryEntity = entityList.find(
      (e) => e.entityType === "Primary entity"
    );
    const currentEntity = fund.owners?.[0] || "";
    const entityValue = currentEntity || primaryEntity?.entityName || "";
    const nameValue = fund.description || "Retirement fund";

    // Two-Pot per-fund outcome calc. Aggregate SARS lump-sum tax across
    // all funds lives in the Project view — here we just split capital
    // into the lump sum vs the residual that buys an annuity. Basis
    // follows the shared At-retirement / Today toggle.
    const componentValue = fund.component || "Vested";
    const lumpSumPercentRaw =
      parseFloat((fund.lumpSumPercent || "0%").replace("%", "")) || 0;
    const baseCapital = atRetirement
      ? perVehicle?.capitalAtRetirement ?? 0
      : perVehicle?.valueInCurrentTerms ?? 0;
    const lumpSumR = baseCapital * (lumpSumPercentRaw / 100);
    const toAnnuityR = baseCapital - lumpSumR;

    // Defaults align with the client's screen: Vested/Opted out commute
    // 1/3, Retirement pot must annuitise fully, Savings pot fully
    // commutable. The advisor can dial after — Retirement stays locked.
    const componentLumpSumDefault: Record<string, string> = {
      Vested: "33.33%",
      Retirement: "0%",
      Savings: "100%",
      "Opted out": "33.33%",
    };
    const handleComponentChange = (newComponent: string) => {
      onUpdate(fund.id, "component", newComponent);
      onUpdate(
        fund.id,
        "lumpSumPercent",
        componentLumpSumDefault[newComponent] ?? "0%"
      );
    };
    const lumpSumDisabled = disabled || componentValue === "Retirement";

    return (
      <GroupedDetailForm>
        <FieldGroup
          title="Retirement fund"
          outcomes={[
            {
              label: atRetirement
                ? "Value at retirement"
                : "Value in current terms",
              value: formatRand(baseCapital),
            },
            { label: "Lump sum", value: formatRand(lumpSumR) },
            { label: "To annuity", value: formatRand(toAnnuityR) },
          ]}
        >
          <div className="flex gap-3 flex-wrap items-end">
            <FormField label="Name">
              <input
                type="text"
                defaultValue={nameValue}
                className="table-input"
                style={{ minWidth: "200px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("description", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Entity">
              <Select
                value={entityValue || "none"}
                onValueChange={(v) => {
                  const value = v === "none" ? "" : v;
                  onUpdate(fund.id, "owners", [value]);
                  onUpdate(fund.id, "ownershipPercentages", ["100%"]);
                }}
                disabled={disabled}
              >
                <SelectTrigger
                  className="table-input"
                  style={{ minWidth: "180px" }}
                >
                  <SelectValue placeholder="Select entity..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select entity...</SelectItem>
                  {entityList.map((e) => (
                    <SelectItem key={e.id} value={e.entityName ?? ""}>
                      {e.entityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Component">
              <Select
                value={componentValue}
                onValueChange={handleComponentChange}
                disabled={disabled}
              >
                <SelectTrigger
                  className="table-input"
                  style={{ minWidth: "140px" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vested">Vested</SelectItem>
                  <SelectItem value="Retirement">Retirement</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Opted out">Opted out</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Lump sum %">
              <input
                type="text"
                key={`${fund.id}-${fund.lumpSumPercent}`}
                defaultValue={fund.lumpSumPercent || "0%"}
                className={`table-input ${getValueClass(
                  fund.lumpSumPercent || "0%",
                  "percentage"
                )}`}
                style={{ width: "90px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("lumpSumPercent", e.target.value)
                }
                disabled={lumpSumDisabled}
              />
            </FormField>

            <FormField label="Contribution (PM)">
              <input
                type="text"
                defaultValue={fund.monthlyContribution || "R 0"}
                className={`table-input ${getValueClass(
                  fund.monthlyContribution || "R 0",
                  "currency"
                )}`}
                style={{ width: "120px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("monthlyContribution", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Increase %">
              <input
                type="text"
                defaultValue={fund.contributionEscalation || "0%"}
                className={`table-input ${getValueClass(
                  fund.contributionEscalation || "0%",
                  "percentage"
                )}`}
                style={{ width: "90px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("contributionEscalation", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Growth Rate">
              <input
                type="text"
                defaultValue={fund.growthRate || "10%"}
                className={`table-input ${getValueClass(
                  fund.growthRate || "10%",
                  "percentage"
                )}`}
                style={{ width: "90px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("growthRate", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Current Value">
              <input
                type="text"
                defaultValue={fund.fundValue || "R 0"}
                className={`table-input ${getValueClass(
                  fund.fundValue || "R 0",
                  "currency"
                )}`}
                style={{ width: "120px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextFieldBlur("fundValue", e.target.value)}
                disabled={disabled}
              />
            </FormField>
          </div>
        </FieldGroup>
      </GroupedDetailForm>
    );
  }

  return (
    <GroupedDetailForm>
      {/* Group 1: Overview (Owner → Fund → Benefits) */}
      <FieldGroup title="Overview">
        <div className="space-y-4">
          <FormField label="Fund Description">
            <input
              type="text"
              defaultValue={fund.description || ""}
              placeholder="Enter details ..."
              className={`table-input ${
                fund.description ? "" : "text-neutral-400"
              }`}
              style={{ width: "fit-content", minWidth: "200px" }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur("description", e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Owners & Fund Values">
            <table
              className="border-collapse"
              style={{
                tableLayout: "fixed",
                width: "fit-content",
                minWidth: "740px",
              }}
            >
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "60px" }}>
                    ACTIONS
                  </th>
                  <th className="text-left" style={{ width: "300px" }}>
                    OWNER
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    OWNERSHIP %
                  </th>
                  <th className="text-right" style={{ width: "100px" }}>
                    FUND VALUE
                  </th>
                  <th className="text-right" style={{ width: "100px" }}>
                    APPROVED COVER
                  </th>
                  <th className="text-right" style={{ width: "100px" }}>
                    VALUE AT DEATH
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  { length: Math.max(fund.owners.length, 1) },
                  (_, rowIndex) => (
                    <tr key={`owner-table-row-${rowIndex}`}>
                      <EntityOwnerSelector
                        policyId={fund.id}
                        owners={fund.owners}
                        ownershipPercentages={
                          fund.ownershipPercentages || ["100%"]
                        }
                        onOwnerChange={onOwnerChange}
                        onOwnershipPercentageChange={
                          onOwnershipPercentageChange
                        }
                        onAddOwner={onAddOwner}
                        onRemoveOwner={onRemoveOwner}
                        rowIndex={rowIndex}
                        disabled={disabled}
                      />
                      <td className="px-1 py-1" style={{ width: "100px" }}>
                        {rowIndex === 0 && (
                          <input
                            type="text"
                            defaultValue={fund.fundValue || "R 0"}
                            className={`${getFieldClass(
                              "currency"
                            )} table-input ${getValueClass(
                              fund.fundValue || "R 0",
                              "currency"
                            )}`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) =>
                              handleTextFieldBlur("fundValue", e.target.value)
                            }
                            disabled={disabled}
                          />
                        )}
                      </td>
                      <td className="px-1 py-1" style={{ width: "100px" }}>
                        {rowIndex === 0 && (
                          <input
                            type="text"
                            defaultValue={fund.approvedLifeCover || "R 0"}
                            className={`${getFieldClass(
                              "currency"
                            )} table-input ${getValueClass(
                              fund.approvedLifeCover || "R 0",
                              "currency"
                            )}`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) =>
                              handleTextFieldBlur(
                                "approvedLifeCover",
                                e.target.value
                              )
                            }
                            disabled={disabled}
                          />
                        )}
                      </td>
                      <td className="px-1 py-1" style={{ width: "100px" }}>
                        {rowIndex === 0 && (
                          <div className="calculated-field text-right">
                            {fund.fundValueAtDeath || "R 0"}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 2: Unapproved Life Cover Distribution */}
      <FieldGroup title="Unapproved Life Cover Distribution">
        <div className="space-y-4">
          <FormField label="Cover Amount">
            <input
              type="text"
              defaultValue={fund.coverAmount || "R 0"}
              className={`table-input ${getValueClass(
                fund.coverAmount || "R 0",
                "currency"
              )}`}
              style={{ width: "fit-content", minWidth: "120px" }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur("coverAmount", e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Beneficiaries & Cover Distribution">
            <table
              className="border-collapse"
              style={{
                tableLayout: "fixed",
                width: "fit-content",
                minWidth: "640px",
              }}
            >
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "60px" }}>
                    ACTIONS
                  </th>
                  <th className="text-left" style={{ width: "300px" }}>
                    BENEFICIARY
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    BENEFIT %
                  </th>
                  <th className="text-right" style={{ width: "100px" }}>
                    COVER SPLIT
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  { length: Math.max(fund.unapprovedBeneficiaries.length, 1) },
                  (_, rowIndex) => (
                    <tr key={`unapproved-beneficiary-table-row-${rowIndex}`}>
                      <EntityBeneficiarySelector
                        policyId={fund.id}
                        beneficiaries={fund.unapprovedBeneficiaries}
                        beneficiaryPercentages={
                          fund.unapprovedPercentageSplits || ["100%"]
                        }
                        onBeneficiaryChange={onUnapprovedBeneficiaryChange}
                        onBeneficiaryPercentageChange={
                          onUnapprovedPercentageChange
                        }
                        onAddBeneficiary={onAddUnapprovedBeneficiary}
                        onRemoveBeneficiary={onRemoveUnapprovedBeneficiary}
                        rowIndex={rowIndex}
                        disabled={disabled}
                      />
                      <td className="px-1 py-1" style={{ width: "100px" }}>
                        <div className="calculated-field text-right">
                          {fund.unapprovedCoverSplits?.[rowIndex] || "R 0"}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 3: Monthly Death Benefit (Toggle Pattern) */}
      <FieldGroup title="Monthly Death Benefit">
        <div className="space-y-4">
          <FormField label="Monthly Income & Terms">
            <div className="flex items-center gap-4">
              <input
                type="text"
                defaultValue={fund.monthlyIncome || "R 0"}
                className={`table-input ${getValueClass(
                  fund.monthlyIncome || "R 0",
                  "currency"
                )}`}
                style={{ width: "120px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("monthlyIncome", e.target.value)
                }
                disabled={disabled}
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fund.monthlyIncomeCheckbox || false}
                  onChange={(e) =>
                    onUpdate(fund.id, "monthlyIncomeCheckbox", e.target.checked)
                  }
                  disabled={disabled}
                />
                <span className="text-sm">Apply Monthly Income</span>
              </label>

              <input
                type="text"
                defaultValue={fund.termYears || "0 years"}
                className={`table-input ${getValueClass(
                  fund.termYears || "0 years",
                  "years"
                )}`}
                style={{ width: "100px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextFieldBlur("termYears", e.target.value)}
                disabled={disabled}
              />

              <input
                type="text"
                defaultValue={fund.increasePercentage || "0%"}
                className={`table-input ${getValueClass(
                  fund.increasePercentage || "0%",
                  "percentage"
                )}`}
                style={{ width: "80px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("increasePercentage", e.target.value)
                }
                disabled={disabled}
              />
            </div>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 4: Fund Value Beneficiaries */}
      <FieldGroup title="Fund Value Beneficiaries">
        <div className="space-y-4">
          <FormField label="Additional Fund Details">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Lump Sum Taken</label>
                <input
                  type="text"
                  defaultValue={fund.lumpSumTaken || "R 0"}
                  className={`table-input ${getValueClass(
                    fund.lumpSumTaken || "R 0",
                    "currency"
                  )}`}
                  style={{ width: "120px" }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) =>
                    handleTextFieldBlur("lumpSumTaken", e.target.value)
                  }
                  disabled={disabled}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Non-Deductible</label>
                <input
                  type="text"
                  defaultValue={fund.nonDeductibleContribution || "R 0"}
                  className={`table-input ${getValueClass(
                    fund.nonDeductibleContribution || "R 0",
                    "currency"
                  )}`}
                  style={{ width: "120px" }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) =>
                    handleTextFieldBlur(
                      "nonDeductibleContribution",
                      e.target.value
                    )
                  }
                  disabled={disabled}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Income Term</label>
                <input
                  type="text"
                  defaultValue={fund.incomeTerm || "0 years"}
                  className={`table-input ${getValueClass(
                    fund.incomeTerm || "0 years",
                    "years"
                  )}`}
                  style={{ width: "100px" }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) =>
                    handleTextFieldBlur("incomeTerm", e.target.value)
                  }
                  disabled={disabled}
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fund.livingAnnuityCheckbox || false}
                  onChange={(e) =>
                    onUpdate(fund.id, "livingAnnuityCheckbox", e.target.checked)
                  }
                  disabled={disabled}
                />
                <span className="text-sm">Living Annuity</span>
              </label>
            </div>
          </FormField>

          <FormField label="Fund Value Beneficiaries">
            <table
              className="border-collapse"
              style={{
                tableLayout: "fixed",
                width: "fit-content",
                minWidth: "640px",
              }}
            >
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "60px" }}>
                    ACTIONS
                  </th>
                  <th className="text-left" style={{ width: "300px" }}>
                    BENEFICIARY
                  </th>
                  <th className="text-center" style={{ width: "80px" }}>
                    BENEFIT %
                  </th>
                  <th className="text-right" style={{ width: "100px" }}>
                    COVER SPLIT
                  </th>
                  <th className="text-right" style={{ width: "100px" }}>
                    LIVING ANNUITY
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  { length: Math.max(fund.fundValueBeneficiaries.length, 1) },
                  (_, rowIndex) => (
                    <tr key={`fund-value-beneficiary-table-row-${rowIndex}`}>
                      <EntityBeneficiarySelector
                        policyId={fund.id}
                        beneficiaries={fund.fundValueBeneficiaries}
                        beneficiaryPercentages={
                          fund.fundValuePercentageSplits || ["100%"]
                        }
                        onBeneficiaryChange={onFundValueBeneficiaryChange}
                        onBeneficiaryPercentageChange={
                          onFundValuePercentageChange
                        }
                        onAddBeneficiary={onAddFundValueBeneficiary}
                        onRemoveBeneficiary={onRemoveFundValueBeneficiary}
                        rowIndex={rowIndex}
                        disabled={disabled}
                      />
                      <td className="px-1 py-1" style={{ width: "100px" }}>
                        <div className="calculated-field text-right">
                          {fund.fundValueCoverSplits?.[rowIndex] || "R 0"}
                        </div>
                      </td>
                      <td className="px-1 py-1" style={{ width: "100px" }}>
                        <div className="calculated-field text-right">
                          {fund.livingAnnuity || "R 0"}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 5: Retirement Projection — only rendered inside the Retirement need flow */}
      {showRetirementProjection && (
        <FieldGroup title="Retirement Projection">
          <div
            className="grid grid-cols-5 gap-x-3 gap-y-4 items-end"
            style={{ width: "fit-content" }}
          >
            <FormField label="Monthly Contribution">
              <input
                type="text"
                defaultValue={fund.monthlyContribution || "R 0"}
                placeholder="R 0"
                className={`table-input ${getValueClass(
                  fund.monthlyContribution || "R 0",
                  "currency"
                )}`}
                style={{ width: "fit-content", minWidth: "120px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("monthlyContribution", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Contribution Escalation">
              <input
                type="text"
                defaultValue={fund.contributionEscalation || "0%"}
                placeholder="0%"
                className={`table-input ${getValueClass(
                  fund.contributionEscalation || "0%",
                  "percentage"
                )}`}
                style={{ width: "fit-content", minWidth: "120px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("contributionEscalation", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Growth Rate">
              <input
                type="text"
                defaultValue={fund.growthRate || "10%"}
                placeholder="10%"
                className={`table-input ${getValueClass(
                  fund.growthRate || "10%",
                  "percentage"
                )}`}
                style={{ width: "fit-content", minWidth: "120px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextFieldBlur("growthRate", e.target.value)
                }
                disabled={disabled}
              />
            </FormField>

            <FormField label="Capital at Retirement">
              <div className="calculated-field" style={{ minWidth: "140px" }}>
                {formatRand(perVehicle?.capitalAtRetirement)}
              </div>
            </FormField>

            <FormField label="Value in Current Terms">
              <div className="calculated-field" style={{ minWidth: "140px" }}>
                {formatRand(perVehicle?.valueInCurrentTerms)}
              </div>
            </FormField>
          </div>
        </FieldGroup>
      )}
    </GroupedDetailForm>
  );
}
