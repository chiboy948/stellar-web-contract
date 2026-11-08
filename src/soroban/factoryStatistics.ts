import { err, ok, StellarwebErrorCode, type StellarwebResult } from "../shared/response";

export interface FactoryStatistics {
  factoryId: string;
  totalPairs: number;
  deployment: {
    network: string;
    ledger: number | null;
    deployedAt: string | null;
  };
}

export interface FactoryStatisticsSource {
  getTotalPairs(factoryId: string): Promise<number>;
  getDeploymentMetadata(factoryId: string): Promise<{
    network: string;
    ledger?: number;
    deployedAt?: string;
  }>;
}

/**
 * Framework-independent endpoint logic for `GET /factory/:id/statistics`.
 * API adapters can serialize the returned StellarwebResult directly as JSON.
 */
export async function getFactoryStatistics(
  factoryId: string,
  source: FactoryStatisticsSource,
): Promise<StellarwebResult<FactoryStatistics>> {
  if (!factoryId.trim()) {
    return err(StellarwebErrorCode.INVALID_ADDRESS, "factoryId is required");
  }
  try {
    const [totalPairs, deployment] = await Promise.all([
      source.getTotalPairs(factoryId),
      source.getDeploymentMetadata(factoryId),
    ]);
    return ok({
      factoryId,
      totalPairs,
      deployment: {
        network: deployment.network,
        ledger: deployment.ledger ?? null,
        deployedAt: deployment.deployedAt ?? null,
      },
    });
  } catch (cause) {
    return err(
      StellarwebErrorCode.CONTRACT_READ_FAILED,
      "Failed to load factory statistics",
      cause,
    );
  }
}
